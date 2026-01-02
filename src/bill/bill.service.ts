import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';
import { Bill, Prisma } from '@prisma/client';
import {
  CreateBillDto,
  PaymentStatus,
  BillStatus,
} from './dto/create-bill.dto';
import {
  CreateQuickServiceBillDto,
  QuickServiceCalculationDto,
  CartItemDto,
  PaymentSplitDto,
} from './dto/quick-service.dto';
import {
  SimplifiedMoneyExchangeDto,
  SimplifiedMoneyExchangeResponseDto,
} from './dto/money-exchange.dto';
import { MoneyExchangeService } from '../money-exchange/money-exchange.service';

// Define proper interfaces
interface BillItemWithService {
  serviceId?: string;
  itemName: string;
  itemType: string;
  quantity: number;
  price: number;
  costPrice?: number;
  commission?: number;
  profit?: number;
  metadata?: any;
  totalAmount?: number; // This will be calculated
}

@Injectable()
export class BillService {
  constructor(
    private prisma: PrismaService,
    private moneyExchangeService: MoneyExchangeService,
  ) {}

  async generateBillNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));

    const todayBillsCount = await this.prisma.bill.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const sequence = (todayBillsCount + 1).toString().padStart(3, '0');
    return `BILL-${year}${month}${day}-${sequence}`;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    customerId?: string;
    customerPhone?: string;
    paymentMode?: string;
    paymentStatus?: string;
    billStatus?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Bill[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      customerId,
      customerPhone,
      paymentMode,
      paymentStatus,
      billStatus,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.BillWhereInput = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (customerPhone) {
      where.customerPhone = customerPhone;
    }

    if (paymentMode) {
      where.paymentMode = paymentMode;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (billStatus) {
      where.billStatus = billStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (search) {
      where.OR = [
        { billNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const orderBy: Prisma.BillOrderByWithRelationInput = {};
    if (sortBy === 'totalAmount') {
      orderBy.totalAmount = sortOrder;
    } else if (sortBy === 'billNumber') {
      orderBy.billNumber = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        include: {
          items: {
            include: {
              service: true,
            },
          },
          customer: true,
          transactions: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: true,
        transactions: {
          include: {
            account: true,
            relatedAccount: true,
          },
        },
      },
    });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    const {
      customerId,
      customerName,
      customerPhone,
      paymentMode,
      accountId,
      items,
      taxAmount = 0,
      discount = 0,
      notes,
      autoCalculateProfit = true,
    } = createBillDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Bill must have at least one item');
    }

    // Convert DTO items to our interface
    const billItems: BillItemWithService[] = items.map(item => ({
      serviceId: item.serviceId,
      itemName: item.itemName,
      itemType: item.itemType,
      quantity: item.quantity,
      price: item.price,
      costPrice: item.costPrice,
      commission: item.commission,
      profit: item.profit,
      metadata: item.metadata,
    }));

    // Calculate totals with commission
    const itemCalculations = await this.calculateBillItemsWithCommission(
      billItems,
      autoCalculateProfit,
    );

    const totalAmount = itemCalculations.totalAmount;
    const totalCommission = itemCalculations.totalCommission;
    const totalProfit = itemCalculations.totalProfit;
    const netAmount = totalAmount + taxAmount - discount;

    if (netAmount <= 0) {
      throw new BadRequestException('Net amount must be positive');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Payment account not found');
    }

    let finalCustomerId = customerId;
    if (!customerId && customerPhone) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { phone: customerPhone },
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else if (customerName) {
        const newCustomer = await this.prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
          },
        });
        finalCustomerId = newCustomer.id;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const billNumber = await this.generateBillNumber();

      // 1. Create Bill with commission and profit
      const bill = await tx.bill.create({
        data: {
          billNumber,
          customerId: finalCustomerId,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          totalAmount,
          taxAmount,
          discount,
          netAmount,
          commission: totalCommission,
          profit: totalProfit,
          paymentMode,
          paymentStatus: PaymentStatus.PAID,
          billStatus: BillStatus.ACTIVE,
          accountId,
          notes,
          items: {
            create: itemCalculations.itemsWithCommission.map(item => ({
              serviceId: item.serviceId,
              itemType: item.itemType,
              itemName: item.itemName,
              quantity: item.quantity,
              price: item.price,
              costPrice: item.costPrice,
              commission: item.commission,
              profit: item.profit,
              totalAmount: item.totalAmount,
              metadata: item.metadata,
            })),
          },
        },
        include: {
          items: {
            include: {
              service: true,
            },
          },
          customer: true,
        },
      });

      // 2. Create Transaction with commission and profit
      await tx.transaction.create({
        data: {
          accountId,
          amount: netAmount,
          direction: 'IN',
          type: 'SERVICE',
          subType: 'BILL_PAYMENT',
          description: `Payment for bill ${bill.billNumber}`,
          billId: bill.id,
          netAmount: netAmount,
          commission: totalCommission,
          profit: totalProfit,
          status: 'COMPLETED',
          metadata: {
            billNumber: bill.billNumber,
            customerName: customerName,
            customerPhone: customerPhone,
            totalCommission: totalCommission,
            totalProfit: totalProfit,
          },
        },
      });

      // 3. Update Account balance
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: netAmount,
          },
        },
      });

      return bill;
    });
  }

  /**
   * Calculate commission and profit for bill items
   * commissionRate is AMOUNT in rupees, not percentage
   */
  private async calculateBillItemsWithCommission(
    items: BillItemWithService[],
    autoCalculateProfit: boolean,
  ): Promise<{
    totalAmount: number;
    totalCommission: number;
    totalProfit: number;
    itemsWithCommission: any[];
  }> {
    let totalAmount = 0;
    let totalCommission = 0;
    let totalProfit = 0;
    const itemsWithCommission: any[] = [];

    for (const item of items) {
      const totalItemAmount = item.quantity * item.price;
      const itemCost = item.costPrice || 0;
      let itemCommission = item.commission || 0;
      let itemProfit = item.profit || 0;

      // Get service details if serviceId is provided
      if (item.serviceId && autoCalculateProfit) {
        const service = await this.prisma.service.findUnique({
          where: { id: item.serviceId },
        });

        if (service) {
          // commissionRate is AMOUNT in rupees
          const commissionAmount = service.commissionRate || 0;
          const serviceType = service.serviceType || 'FIXED_COMMISSION';

          // Calculate commission based on service type
          switch (serviceType) {
            case 'PERCENTAGE_COMMISSION':
              // If service type says percentage but commissionRate is amount,
              // we need to check how it's used. For now, treat as fixed amount.
              // Commission is the fixed amount from commissionRate
              itemCommission = commissionAmount * item.quantity;
              itemProfit = itemCommission;
              break;

            case 'FIXED_COMMISSION':
            case 'FIXED_PRICE':
              // For fixed commission services, commission = commissionRate * quantity
              // Profit is the commission amount
              itemCommission = commissionAmount * item.quantity;
              itemProfit = itemCommission;
              break;

            case 'MARKUP':
              // For markup, commissionRate is the markup amount
              // Profit = markup amount * quantity
              itemCommission = commissionAmount * item.quantity;
              itemProfit = itemCommission;
              break;

            default:
              // Default: commissionRate is fixed amount per item
              itemCommission = commissionAmount * item.quantity;
              itemProfit = itemCommission;
              break;
          }
        } else if (autoCalculateProfit) {
          // Service not found, use default calculation
          itemCommission = totalItemAmount * 0.1; // 10% default commission as amount
          itemProfit = itemCommission;
        }
      } else if (autoCalculateProfit && !item.serviceId) {
        // For non-service items, use default commission (10% of item amount)
        itemCommission = totalItemAmount * 0.1;
        itemProfit = itemCommission;
      }

      // If commission was manually provided, use it
      if (item.commission && item.commission > 0) {
        itemCommission = item.commission;
        itemProfit = item.profit || itemCommission;
      }

      const itemWithCommission = {
        ...item,
        totalAmount: totalItemAmount,
        commission: itemCommission,
        profit: itemProfit,
      };

      itemsWithCommission.push(itemWithCommission);

      totalAmount += totalItemAmount;
      totalCommission += itemCommission;
      totalProfit += itemProfit;
    }

    return {
      totalAmount,
      totalCommission,
      totalProfit,
      itemsWithCommission,
    };
  }

  async delete(id: string): Promise<Bill> {
    const bill = await this.findOne(id);

    if (bill.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        'Cannot delete paid bill. Refund it first.',
      );
    }

    return this.prisma.bill.delete({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });
  }

  async createQuickServiceBill(
    createQuickServiceBillDto: CreateQuickServiceBillDto,
  ): Promise<Bill> {
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      paymentMethod,
      paymentSplits,
      accountId,
      taxAmount = 0,
      discount = 0,
      notes,
      autoCalculateProfit = true,
    } = createQuickServiceBillDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Bill must have at least one item');
    }

    if (!accountId) {
      throw new BadRequestException('Payment account ID is required');
    }

    // Calculate totals with commission for quick service
    const calculations = await this.calculateQuickServiceItemsWithCommission(
      items,
      autoCalculateProfit,
    );

    const totalAmount = calculations.subtotal + calculations.onlinePayments;
    const netAmount = totalAmount + taxAmount - discount;

    if (netAmount <= 0) {
      throw new BadRequestException('Net amount must be positive');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Payment account not found');
    }

    let finalCustomerId = customerId;
    if (!customerId && customerPhone) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { phone: customerPhone },
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else if (customerName) {
        const newCustomer = await this.prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
          },
        });
        finalCustomerId = newCustomer.id;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const billNumber = await this.generateBillNumber();

      const splitPaymentsData =
        paymentMethod === 'split' ? paymentSplits : null;
      
      const onlinePaymentItems = items.filter(
        (item) => (item.onlinePaymentTotal || 0) > 0 && item.onlinePaymentWalletId,
      );

      // Validate wallet balances
      for (const item of onlinePaymentItems) {
        const wallet = await tx.account.findUnique({
          where: { id: item.onlinePaymentWalletId },
        });
        
        if (!wallet) {
          throw new NotFoundException(`Wallet not found for ${item.name}`);
        }
        
        const onlinePaymentTotal = item.onlinePaymentTotal ?? 0;
        if (wallet.balance < onlinePaymentTotal) {
          throw new BadRequestException(
            `Insufficient balance in ${wallet.name} for ${item.name}. Required: ₹${onlinePaymentTotal}, Available: ₹${wallet.balance}`,
          );
        }
      }

      // Calculate commission for each item
      const itemsWithCommission = await Promise.all(
        items.map(async (item) => {
          const itemCalculation = await this.calculateQuickServiceItemCommission(item, autoCalculateProfit);
          
          return {
            ...item,
            commission: itemCalculation.commission,
            profit: itemCalculation.profit,
            totalAmount: (item.total || 0) + (item.onlinePaymentTotal || 0),
          };
        })
      );

      // 1. Create Bill with commission
      const bill = await tx.bill.create({
        data: {
          billNumber,
          customerId: finalCustomerId,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          totalAmount,
          taxAmount,
          discount,
          netAmount,
          commission: calculations.commission,
          profit: calculations.profit,
          paymentMode: this.getPrimaryPaymentMode(paymentSplits),
          paymentStatus: PaymentStatus.PAID,
          billStatus: BillStatus.ACTIVE,
          accountId: accountId,
          notes,
          serviceType: 'QUICK_SERVICE',
          splitPayments: splitPaymentsData as any,
          items: {
            create: itemsWithCommission.map((item) => ({
              itemType: 'SERVICE',
              itemName: item.name,
              quantity: item.quantity,
              price: item.price,
              totalAmount: item.totalAmount,
              commission: item.commission,
              profit: item.profit,
              metadata: {
                code: item.code,
                onlinePaymentAmount: item.onlinePaymentAmount || 0,
                onlinePaymentTotal: item.onlinePaymentTotal || 0,
                requiresOnlinePayment: item.requiresOnlinePayment || false,
                onlinePaymentWalletId: item.onlinePaymentWalletId || '',
                onlinePaymentWalletName: item.onlinePaymentWalletName || '',
                commissionAmount: item.commission,
              } as any,
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      // 2. Deduct Online Payments from wallets
      for (const item of onlinePaymentItems) {
        const onlinePaymentTotal = item.onlinePaymentTotal || 0;
        if (item.onlinePaymentWalletId && onlinePaymentTotal > 0) {
          await tx.transaction.create({
            data: {
              accountId: item.onlinePaymentWalletId,
              amount: onlinePaymentTotal,
              direction: 'OUT',
              type: 'SERVICE',
              subType: 'ONLINE_PAYMENT',
              description: `Online payment for ${item.name} in bill ${bill.billNumber}`,
              billId: bill.id,
              netAmount: onlinePaymentTotal,
              commission: 0,
              profit: 0,
              status: 'COMPLETED',
              metadata: {
                serviceName: item.name,
                billNumber: bill.billNumber,
                customerName: customerName || '',
                customerPhone: customerPhone || '',
                onlinePaymentAmount: item.onlinePaymentAmount || 0,
                onlinePaymentTotal: onlinePaymentTotal,
              } as any,
            },
          });

          await tx.account.update({
            where: { id: item.onlinePaymentWalletId },
            data: {
              balance: {
                decrement: onlinePaymentTotal,
              },
            },
          });
        }
      }

      // 3. Process payment splits with commission allocation
      if (paymentMethod === 'split' && paymentSplits) {
        for (const split of paymentSplits) {
          if (split.amount > 0) {
            const splitAccountId = split.walletAccountId || accountId;
            const splitCommission = this.calculateSplitCommission(split.amount, calculations);
            const splitProfit = this.calculateSplitProfit(split.amount, calculations);
            
            await tx.transaction.create({
              data: {
                accountId: splitAccountId,
                amount: split.amount,
                direction: 'IN',
                type: 'SERVICE',
                subType: 'QUICK_SERVICE_PAYMENT',
                description: `Payment for bill ${bill.billNumber} (${split.method})`,
                billId: bill.id,
                netAmount: split.amount,
                commission: splitCommission,
                profit: splitProfit,
                status: 'COMPLETED',
                metadata: {
                  billNumber: bill.billNumber,
                  customerName: customerName || '',
                  customerPhone: customerPhone || '',
                  paymentMethod: split.method,
                  splitIndex: paymentSplits.indexOf(split),
                  commissionAllocated: splitCommission,
                  profitAllocated: splitProfit,
                } as any,
              },
            });

            await tx.account.update({
              where: { id: splitAccountId },
              data: {
                balance: {
                  increment: split.amount,
                },
              },
            });
          }
        }
      } else {
        // Single payment method
        await tx.transaction.create({
          data: {
            accountId: accountId,
            amount: netAmount,
            direction: 'IN',
            type: 'SERVICE',
            subType: 'QUICK_SERVICE_PAYMENT',
            description: `Payment for quick service bill ${bill.billNumber}`,
            billId: bill.id,
            netAmount: netAmount,
            commission: calculations.commission,
            profit: calculations.profit,
            status: 'COMPLETED',
            metadata: {
              billNumber: bill.billNumber,
              customerName: customerName || '',
              customerPhone: customerPhone || '',
              paymentMethod: paymentMethod,
              includesOnlinePayments: calculations.onlinePayments > 0,
              onlinePaymentsTotal: calculations.onlinePayments,
              commissionAmount: calculations.commission,
              profitAmount: calculations.profit,
            } as any,
          },
        });

        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: netAmount,
            },
          },
        });
      }

      return bill;
    });
  }

  /**
   * Calculate commission for quick service items
   * commissionRate is AMOUNT in rupees
   */
  private async calculateQuickServiceItemsWithCommission(
    items: CartItemDto[],
    autoCalculateProfit: boolean,
  ): Promise<QuickServiceCalculationDto & { commission: number }> {
    let subtotal = 0;
    let onlinePayments = 0;
    let accountSpend = 0;
    let commission = 0;
    let profit = 0;

    for (const item of items) {
      const itemTotal = item.quantity * item.price;
      const itemOnlinePayment = item.quantity * (item.onlinePaymentAmount || 0);
      const itemAccountSpend = item.quantity * (item.accountAmount || 0);

      subtotal += itemTotal;
      onlinePayments += itemOnlinePayment;
      accountSpend += itemAccountSpend;

      // Calculate item commission
      const itemCalculation = await this.calculateQuickServiceItemCommission(item, autoCalculateProfit);
      
      commission += itemCalculation.commission;
      profit += itemCalculation.profit;
    }

    const total = subtotal + onlinePayments;

    return {
      subtotal,
      onlinePayments,
      accountSpend,
      total,
      commission,
      profit,
    };
  }

  /**
   * Calculate commission for individual quick service item
   * commissionRate is AMOUNT in rupees
   */
  private async calculateQuickServiceItemCommission(
    item: CartItemDto,
    autoCalculateProfit: boolean,
  ): Promise<{ commission: number; profit: number }> {
    let commission = 0;
    let profit = 0;

    if (autoCalculateProfit && item.name) {
      // Try to find service by name (case-insensitive search)
      const services = await this.prisma.service.findMany({
        where: {
          isActive: true,
        },
      });

      // Find service by name (case-insensitive match)
      const service = services.find(s => 
        s.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(s.name.toLowerCase())
      );

      if (service) {
        // commissionRate is AMOUNT in rupees
        const commissionAmount = service.commissionRate || 0;
        
        // Commission = commissionAmount * quantity
        commission = commissionAmount * item.quantity;
        profit = commission; // Profit = Commission for most cases
      } else {
        // Default commission for items without service
        // 10% of item amount as commission
        const defaultCommissionRate = 0.1; // 10%
        commission = (item.price * item.quantity) * defaultCommissionRate;
        profit = commission;
      }
    } else {
      // Use default calculation
      const defaultCommissionRate = 0.1; // 10%
      commission = (item.price * item.quantity) * defaultCommissionRate;
      profit = commission;
    }

    return { commission, profit };
  }

  private calculateItemProfit(item: CartItemDto): number {
    if (item.requiresOnlinePayment && (item.onlinePaymentAmount || 0) > 0) {
      return item.price * item.quantity;
    } else {
      return item.price * item.quantity * 0.2;
    }
  }

  private calculateSplitCommission(amount: number, calculations: QuickServiceCalculationDto & { commission: number }): number {
    const totalAmount = calculations.subtotal + calculations.onlinePayments;
    if (totalAmount === 0) return 0;
    
    return (amount / totalAmount) * calculations.commission;
  }

  private calculateSplitProfit(amount: number, calculations: QuickServiceCalculationDto & { profit: number }): number {
    const totalAmount = calculations.subtotal + calculations.onlinePayments;
    if (totalAmount === 0) return 0;
    
    return (amount / totalAmount) * calculations.profit;
  }

  private getPrimaryPaymentMode(paymentSplits: PaymentSplitDto[]): string {
    if (!paymentSplits || paymentSplits.length === 0) return 'CASH';

    const primarySplit =
      paymentSplits.find((split) => split.amount > 0) || paymentSplits[0];
    return primarySplit.method.toUpperCase();
  }

  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [quickServiceBills, moneyExchangeBills, totalRevenue, totalProfit, totalCommission] =
      await Promise.all([
        this.prisma.bill.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            serviceType: 'QUICK_SERVICE',
            paymentStatus: 'PAID',
          },
        }),
        this.prisma.bill.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            serviceType: 'MONEY_EXCHANGE',
            paymentStatus: 'PAID',
          },
        }),
        this.prisma.bill.aggregate({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            paymentStatus: 'PAID',
          },
          _sum: { netAmount: true },
        }),
        this.prisma.bill.aggregate({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            paymentStatus: 'PAID',
          },
          _sum: { profit: true },
        }),
        this.prisma.bill.aggregate({
          where: {
            createdAt: { gte: today, lt: tomorrow },
            paymentStatus: 'PAID',
          },
          _sum: { commission: true },
        }),
      ]);

    return {
      quickServiceCount: quickServiceBills,
      moneyExchangeCount: moneyExchangeBills,
      totalRevenue: totalRevenue._sum.netAmount || 0,
      totalProfit: totalProfit._sum.profit || 0,
      totalCommission: totalCommission._sum.commission || 0,
      date: today.toISOString().split('T')[0],
    };
  }

  async getRecentQuickServices(limit: number = 10) {
    return this.prisma.bill.findMany({
      where: {
        serviceType: 'QUICK_SERVICE',
        paymentStatus: 'PAID',
      },
      include: {
        items: {
          include: {
            service: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createSimplifiedMoneyExchange(
    simplifiedMoneyExchangeDto: SimplifiedMoneyExchangeDto,
  ): Promise<SimplifiedMoneyExchangeResponseDto> {
    return this.moneyExchangeService.createSimplifiedMoneyExchange(
      simplifiedMoneyExchangeDto,
    );
  }
}