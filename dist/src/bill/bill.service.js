"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
const create_bill_dto_1 = require("./dto/create-bill.dto");
const money_exchange_service_1 = require("../money-exchange/money-exchange.service");
let BillService = class BillService {
    prisma;
    moneyExchangeService;
    constructor(prisma, moneyExchangeService) {
        this.prisma = prisma;
        this.moneyExchangeService = moneyExchangeService;
    }
    async generateBillNumber() {
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
    async findAll(params) {
        const { page = 1, limit = 10, customerId, customerPhone, paymentMode, paymentStatus, billStatus, startDate, endDate, search, sortBy = 'createdAt', sortOrder = 'desc', } = params;
        const skip = (page - 1) * limit;
        const where = {};
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
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        if (search) {
            where.OR = [
                { billNumber: { contains: search } },
                { customerName: { contains: search } },
                { customerPhone: { contains: search } },
                { notes: { contains: search } },
            ];
        }
        const orderBy = {};
        if (sortBy === 'totalAmount') {
            orderBy.totalAmount = sortOrder;
        }
        else if (sortBy === 'billNumber') {
            orderBy.billNumber = sortOrder;
        }
        else {
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
    async findOne(id) {
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
        if (!bill)
            throw new common_1.NotFoundException('Bill not found');
        return bill;
    }
    async create(createBillDto) {
        const { customerId, customerName, customerPhone, paymentMode, accountId, items, taxAmount = 0, discount = 0, notes, autoCalculateProfit = true, } = createBillDto;
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('Bill must have at least one item');
        }
        const billItems = items.map(item => ({
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
        const itemCalculations = await this.calculateBillItemsWithCommission(billItems, autoCalculateProfit);
        const totalAmount = itemCalculations.totalAmount;
        const totalCommission = itemCalculations.totalCommission;
        const totalProfit = itemCalculations.totalProfit;
        const netAmount = totalAmount + taxAmount - discount;
        if (netAmount <= 0) {
            throw new common_1.BadRequestException('Net amount must be positive');
        }
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Payment account not found');
        }
        let finalCustomerId = customerId;
        if (!customerId && customerPhone) {
            const existingCustomer = await this.prisma.customer.findUnique({
                where: { phone: customerPhone },
            });
            if (existingCustomer) {
                finalCustomerId = existingCustomer.id;
            }
            else if (customerName) {
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
                    paymentStatus: create_bill_dto_1.PaymentStatus.PAID,
                    billStatus: create_bill_dto_1.BillStatus.ACTIVE,
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
    async calculateBillItemsWithCommission(items, autoCalculateProfit) {
        let totalAmount = 0;
        let totalCommission = 0;
        let totalProfit = 0;
        const itemsWithCommission = [];
        for (const item of items) {
            const totalItemAmount = item.quantity * item.price;
            const itemCost = item.costPrice || 0;
            let itemCommission = item.commission || 0;
            let itemProfit = item.profit || 0;
            if (item.serviceId && autoCalculateProfit) {
                const service = await this.prisma.service.findUnique({
                    where: { id: item.serviceId },
                });
                if (service) {
                    const commissionAmount = service.commissionRate || 0;
                    const serviceType = service.serviceType || 'FIXED_COMMISSION';
                    switch (serviceType) {
                        case 'PERCENTAGE_COMMISSION':
                            itemCommission = commissionAmount * item.quantity;
                            itemProfit = itemCommission;
                            break;
                        case 'FIXED_COMMISSION':
                        case 'FIXED_PRICE':
                            itemCommission = commissionAmount * item.quantity;
                            itemProfit = itemCommission;
                            break;
                        case 'MARKUP':
                            itemCommission = commissionAmount * item.quantity;
                            itemProfit = itemCommission;
                            break;
                        default:
                            itemCommission = commissionAmount * item.quantity;
                            itemProfit = itemCommission;
                            break;
                    }
                }
                else if (autoCalculateProfit) {
                    itemCommission = totalItemAmount * 0.1;
                    itemProfit = itemCommission;
                }
            }
            else if (autoCalculateProfit && !item.serviceId) {
                itemCommission = totalItemAmount * 0.1;
                itemProfit = itemCommission;
            }
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
    async delete(id) {
        const bill = await this.findOne(id);
        if (bill.paymentStatus === create_bill_dto_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('Cannot delete paid bill. Refund it first.');
        }
        return this.prisma.bill.delete({
            where: { id },
            include: {
                items: true,
                customer: true,
            },
        });
    }
    async createQuickServiceBill(createQuickServiceBillDto) {
        const { customerId, customerName, customerPhone, items, paymentMethod, paymentSplits, accountId, taxAmount = 0, discount = 0, notes, autoCalculateProfit = true, } = createQuickServiceBillDto;
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('Bill must have at least one item');
        }
        if (!accountId) {
            throw new common_1.BadRequestException('Payment account ID is required');
        }
        const calculations = await this.calculateQuickServiceItemsWithCommission(items, autoCalculateProfit);
        const totalAmount = calculations.subtotal + calculations.onlinePayments;
        const netAmount = totalAmount + taxAmount - discount;
        if (netAmount <= 0) {
            throw new common_1.BadRequestException('Net amount must be positive');
        }
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Payment account not found');
        }
        let finalCustomerId = customerId;
        if (!customerId && customerPhone) {
            const existingCustomer = await this.prisma.customer.findUnique({
                where: { phone: customerPhone },
            });
            if (existingCustomer) {
                finalCustomerId = existingCustomer.id;
            }
            else if (customerName) {
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
            const splitPaymentsData = paymentMethod === 'split' ? paymentSplits : null;
            const onlinePaymentItems = items.filter((item) => (item.onlinePaymentTotal || 0) > 0 && item.onlinePaymentWalletId);
            for (const item of onlinePaymentItems) {
                const wallet = await tx.account.findUnique({
                    where: { id: item.onlinePaymentWalletId },
                });
                if (!wallet) {
                    throw new common_1.NotFoundException(`Wallet not found for ${item.name}`);
                }
                const onlinePaymentTotal = item.onlinePaymentTotal ?? 0;
                if (wallet.balance < onlinePaymentTotal) {
                    throw new common_1.BadRequestException(`Insufficient balance in ${wallet.name} for ${item.name}. Required: ₹${onlinePaymentTotal}, Available: ₹${wallet.balance}`);
                }
            }
            const itemsWithCommission = await Promise.all(items.map(async (item) => {
                const itemCalculation = await this.calculateQuickServiceItemCommission(item, autoCalculateProfit);
                return {
                    ...item,
                    commission: itemCalculation.commission,
                    profit: itemCalculation.profit,
                    totalAmount: (item.total || 0) + (item.onlinePaymentTotal || 0),
                };
            }));
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
                    paymentStatus: create_bill_dto_1.PaymentStatus.PAID,
                    billStatus: create_bill_dto_1.BillStatus.ACTIVE,
                    accountId: accountId,
                    notes,
                    serviceType: 'QUICK_SERVICE',
                    splitPayments: splitPaymentsData,
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
                            },
                        })),
                    },
                },
                include: {
                    items: true,
                    customer: true,
                },
            });
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
                            },
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
                                },
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
            }
            else {
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
                        },
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
    async calculateQuickServiceItemsWithCommission(items, autoCalculateProfit) {
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
    async calculateQuickServiceItemCommission(item, autoCalculateProfit) {
        let commission = 0;
        let profit = 0;
        if (autoCalculateProfit && item.name) {
            const services = await this.prisma.service.findMany({
                where: {
                    isActive: true,
                },
            });
            const service = services.find(s => s.name.toLowerCase().includes(item.name.toLowerCase()) ||
                item.name.toLowerCase().includes(s.name.toLowerCase()));
            if (service) {
                const commissionAmount = service.commissionRate || 0;
                commission = commissionAmount * item.quantity;
                profit = commission;
            }
            else {
                const defaultCommissionRate = 0.1;
                commission = (item.price * item.quantity) * defaultCommissionRate;
                profit = commission;
            }
        }
        else {
            const defaultCommissionRate = 0.1;
            commission = (item.price * item.quantity) * defaultCommissionRate;
            profit = commission;
        }
        return { commission, profit };
    }
    calculateItemProfit(item) {
        if (item.requiresOnlinePayment && (item.onlinePaymentAmount || 0) > 0) {
            return item.price * item.quantity;
        }
        else {
            return item.price * item.quantity * 0.2;
        }
    }
    calculateSplitCommission(amount, calculations) {
        const totalAmount = calculations.subtotal + calculations.onlinePayments;
        if (totalAmount === 0)
            return 0;
        return (amount / totalAmount) * calculations.commission;
    }
    calculateSplitProfit(amount, calculations) {
        const totalAmount = calculations.subtotal + calculations.onlinePayments;
        if (totalAmount === 0)
            return 0;
        return (amount / totalAmount) * calculations.profit;
    }
    getPrimaryPaymentMode(paymentSplits) {
        if (!paymentSplits || paymentSplits.length === 0)
            return 'CASH';
        const primarySplit = paymentSplits.find((split) => split.amount > 0) || paymentSplits[0];
        return primarySplit.method.toUpperCase();
    }
    async getTodaySummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [quickServiceBills, moneyExchangeBills, totalRevenue, totalProfit, totalCommission] = await Promise.all([
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
    async getRecentQuickServices(limit = 10) {
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
    async createSimplifiedMoneyExchange(simplifiedMoneyExchangeDto) {
        return this.moneyExchangeService.createSimplifiedMoneyExchange(simplifiedMoneyExchangeDto);
    }
};
exports.BillService = BillService;
exports.BillService = BillService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        money_exchange_service_1.MoneyExchangeService])
], BillService);
//# sourceMappingURL=bill.service.js.map