import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';
import {
  MoneyExchangeType,
  CommissionType,
  CommissionDistributionMethod,
  CreateMoneyExchangeDto,
  MoneyExchangeCalculationDto,
  SimplifiedMoneyExchangeDto,
  SimplifiedMoneyExchangeResponseDto,
  CommissionDistributionDto,
  WalletSelectionDto,
} from '../bill/dto/money-exchange.dto';
import { Transaction, Bill, Account } from '@prisma/client';

interface MoneyExchangeResult {
  transaction: Transaction;
  sourceTransaction: Transaction;
  destinationTransaction?: Transaction;
  commissionTransactions: Transaction[];
  calculations: MoneyExchangeCalculationDto;
  bill: Bill;
  walletBalances: any;
}

@Injectable()
export class MoneyExchangeService {
  constructor(private prisma: PrismaService) {}

  async createMoneyExchange(
    createMoneyExchangeDto: CreateMoneyExchangeDto,
  ): Promise<MoneyExchangeResult> {
    const {
      transactionType,
      principalAmount,
      commissionType,
      commissionValue,
      commissionDistribution,
      walletSelection,
      customerPhone,
      customerName,
      notes,
      metadata,
    } = createMoneyExchangeDto;

    console.log('🔍 Creating money exchange:', {
      transactionType,
      principalAmount,
      walletSelection,
      metadata,
    });

    // Validate all wallets
    const wallets = await this.validateWallets(
      walletSelection,
      transactionType,
      metadata,
    );

    // Calculate amounts
    const calculations = this.calculateMoneyExchangeAmounts(
      principalAmount,
      commissionType,
      commissionValue,
      commissionDistribution,
      transactionType,
    );

    // Validate balances
    await this.validateBalances(
      transactionType,
      calculations,
      wallets,
      walletSelection,
      metadata,
    );

    return this.prisma.$transaction(
      async (tx): Promise<MoneyExchangeResult> => {
        const billNumber = await this.generateBillNumber();

        // Convert commissionDistribution to plain object for JSON storage
        const commissionDistributionJson = this.serializeCommissionDistribution(
          commissionDistribution,
        );

        // Create bill with metadata
        const bill = await tx.bill.create({
          data: {
            billNumber,
            customerName,
            customerPhone,
            totalAmount: calculations.totalDebit,
            netAmount: calculations.netAmount,
            commission: calculations.commission,
            profit: calculations.profit,
            paymentMode: this.getPaymentMode(transactionType),
            paymentStatus: 'PAID',
            billStatus: 'ACTIVE',
            accountId: walletSelection.primaryWalletId,
            notes,
            serviceType: 'MONEY_EXCHANGE',
            items: {
              create: {
                itemType: 'SERVICE',
                itemName: this.getServiceName(transactionType),
                quantity: 1,
                price: principalAmount,
                totalAmount: principalAmount,
                commission: calculations.commission,
                profit: calculations.profit,
                metadata: {
                  transactionType,
                  commissionType,
                  commissionValue,
                  commissionDistribution: commissionDistributionJson,
                  customerAmount: calculations.customerAmount,
                  totalDebit: calculations.totalDebit,
                  cashCommission: calculations.cashCommission,
                  digitalCommission: calculations.digitalCommission,
                  isAlreadyReceived: metadata?.isAlreadyReceived || false,
                },
              },
            },
          },
          include: {
            items: true,
          },
        });

        // Handle main transactions based on transaction type
        const { sourceTransaction, destinationTransaction } =
          await this.handleMainTransactions(
            tx,
            bill,
            transactionType,
            calculations,
            walletSelection,
            wallets,
            metadata,
          );

        // Handle commission transactions
        const commissionTransactions = await this.handleCommissionTransactions(
          tx,
          bill,
          calculations,
          commissionDistribution,
          walletSelection,
          wallets,
          transactionType,
        );

        // Update wallet balances - FIXED LOGIC
        const walletBalances = await this.updateWalletBalances(
          tx,
          transactionType,
          calculations,
          walletSelection,
          wallets,
          commissionTransactions,
          metadata,
        );

        return {
          transaction: sourceTransaction,
          sourceTransaction,
          destinationTransaction,
          commissionTransactions,
          calculations,
          bill,
          walletBalances,
        };
      },
    );
  }

  private serializeCommissionDistribution(
    commissionDistribution: CommissionDistributionDto,
  ): any {
    return {
      method: commissionDistribution.method,
      cashCommission: commissionDistribution.cashCommission || 0,
      digitalCommission: commissionDistribution.digitalCommission || 0,
      digitalCommissionWalletId:
        commissionDistribution.digitalCommissionWalletId,
      cashCommissionWalletId: commissionDistribution.cashCommissionWalletId,
      splitRatio: commissionDistribution.splitRatio,
    };
  }

  private async validateWallets(
    walletSelection: WalletSelectionDto,
    transactionType: MoneyExchangeType,
    metadata?: any,
  ) {
    console.log('🔍 Validating wallets:', walletSelection);
    console.log('🔍 Metadata:', metadata);

    // Validate required wallets based on transaction type
    if (!walletSelection.primaryWalletId) {
      throw new BadRequestException('Primary wallet ID is required');
    }

    const wallets: any = {
      primary: await this.validateWallet(walletSelection.primaryWalletId),
    };

    const isAlreadyReceived = metadata?.isAlreadyReceived;

    // For CASH_TO_ONLINE and ONLINE_TO_CASH, cash wallet is required
    if (
      transactionType === MoneyExchangeType.CASH_TO_ONLINE ||
      transactionType === MoneyExchangeType.ONLINE_TO_CASH
    ) {
      if (!walletSelection.cashWalletId) {
        throw new BadRequestException(
          'Cash wallet ID is required for this transaction type',
        );
      }
      wallets.cash = await this.validateWallet(walletSelection.cashWalletId);
    } 
    // For ONLINE_TO_ONLINE, we need secondary wallet only if not already received
    else if (transactionType === MoneyExchangeType.ONLINE_TO_ONLINE) {
      if (!isAlreadyReceived && !walletSelection.secondaryWalletId) {
        throw new BadRequestException(
          'Secondary (customer) wallet ID is required for online to online transfers when money is not already received',
        );
      }
      if (!isAlreadyReceived && walletSelection.secondaryWalletId) {
        wallets.secondary = await this.validateWallet(walletSelection.secondaryWalletId);
      }
    }
    // For other transaction types, validate cash wallet if provided
    else if (walletSelection.cashWalletId) {
      wallets.cash = await this.validateWallet(walletSelection.cashWalletId);
    }

    // Validate commission wallet if provided
    if (walletSelection.commissionWalletId) {
      wallets.commission = await this.validateWallet(
        walletSelection.commissionWalletId,
      );
    }

    // Validate secondary wallet if provided (for backward compatibility)
    if (walletSelection.secondaryWalletId && !wallets.secondary) {
      wallets.secondary = await this.validateWallet(
        walletSelection.secondaryWalletId,
      );
    }

    console.log('✅ Validated wallets:', Object.keys(wallets));
    return wallets;
  }

  private async validateWallet(walletId: string): Promise<Account> {
    const wallet = await this.prisma.account.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    if (!wallet.isActive) {
      throw new BadRequestException(`Wallet ${wallet.name} is not active`);
    }

    return wallet;
  }

  private calculateMoneyExchangeAmounts(
    principalAmount: number,
    commissionType: CommissionType,
    commissionValue: number,
    commissionDistribution: CommissionDistributionDto,
    transactionType: MoneyExchangeType,
  ): MoneyExchangeCalculationDto {
    // Calculate commission
    const commission =
      commissionType === CommissionType.PERCENTAGE
        ? (principalAmount * commissionValue) / 100
        : commissionValue;

    let customerAmount = principalAmount;
    let totalDebit = principalAmount;
    let cashCommission = 0;
    let digitalCommission = 0;
    let netAmount = principalAmount;

    switch (commissionDistribution.method) {
      case CommissionDistributionMethod.DEDUCT_FROM_AMOUNT:
        // Customer receives principal minus commission
        customerAmount = principalAmount - commission;
        totalDebit = principalAmount;
        digitalCommission = commission;
        netAmount = customerAmount;
        break;

      case CommissionDistributionMethod.SEPARATE_ONLINE:
        // Customer receives full amount, we collect commission separately online
        customerAmount = principalAmount;
        totalDebit = principalAmount + commission;
        digitalCommission = commission;
        netAmount = principalAmount;
        break;

      case CommissionDistributionMethod.SEPARATE_CASH:
        // Customer receives full amount, we collect commission in cash
        customerAmount = principalAmount;
        totalDebit = principalAmount;
        cashCommission = commission;
        netAmount = principalAmount;
        break;

      case CommissionDistributionMethod.SPLIT:
        // Split commission between cash and digital
        customerAmount = principalAmount;
        totalDebit = principalAmount + commission;
        cashCommission = commissionDistribution.cashCommission || 0;
        digitalCommission = commission - cashCommission;
        netAmount = principalAmount;
        break;
    }

    const profit = commission;

    return {
      principalAmount,
      commission,
      customerAmount,
      totalDebit,
      netAmount,
      profit,
      cashCommission,
      digitalCommission,
      commissionBreakdown: {
        method: commissionDistribution.method,
        description: this.getCommissionDescription(
          commissionDistribution.method,
          commission,
          cashCommission,
          digitalCommission,
        ),
        customerReceives: customerAmount,
        weCollect: commission,
        walletImpact: totalDebit,
      },
    };
  }

  private async validateBalances(
    transactionType: MoneyExchangeType,
    calculations: MoneyExchangeCalculationDto,
    wallets: any,
    walletSelection: WalletSelectionDto,
    metadata?: any,
  ): Promise<void> {
    console.log('🔍 Validating balances for:', transactionType);
    const isAlreadyReceived = metadata?.isAlreadyReceived;

    switch (transactionType) {
      case MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
        // We receive money in primary wallet, pay cash from cash wallet
        if (
          wallets.cash &&
          calculations.customerAmount > wallets.cash.balance
        ) {
          throw new BadRequestException(
            `Insufficient cash balance. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.cash.balance}`,
          );
        }
        break;

      case MoneyExchangeType.CASH_TO_ONLINE:
        // Customer gives cash, we transfer to customer's online account
        // We need enough online balance to send to customer
        if (calculations.customerAmount > wallets.primary.balance) {
          throw new BadRequestException(
            `Insufficient balance in primary wallet. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.primary.balance}`,
          );
        }
        break;

      case MoneyExchangeType.ONLINE_TO_CASH:
        // Customer transfers online, we give cash
        // We need enough cash to give to customer
        if (calculations.customerAmount > wallets.cash.balance) {
          throw new BadRequestException(
            `Insufficient cash balance. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.cash.balance}`,
          );
        }
        break;

      case MoneyExchangeType.GPAY_TRANSFER:
        // GPay transfer - validate primary wallet balance
        if (calculations.totalDebit > wallets.primary.balance) {
          throw new BadRequestException(
            `Insufficient balance. Required: ₹${calculations.totalDebit}, Available: ₹${wallets.primary.balance}`,
          );
        }
        break;

      case MoneyExchangeType.ONLINE_TO_ONLINE:
        // For already received, no need to validate incoming balance
        if (!isAlreadyReceived && calculations.customerAmount > wallets.primary.balance) {
          throw new BadRequestException(
            `Insufficient balance in primary wallet. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.primary.balance}`,
          );
        }
        break;
    }
  }

  private async handleMainTransactions(
    tx: any,
    bill: Bill,
    transactionType: MoneyExchangeType,
    calculations: MoneyExchangeCalculationDto,
    walletSelection: WalletSelectionDto,
    wallets: any,
    metadata?: any,
  ): Promise<{
    sourceTransaction: Transaction;
    destinationTransaction?: Transaction;
  }> {
    console.log('🔍 Handling main transactions for:', transactionType);
    console.log('🔍 Wallet selection:', walletSelection);
    console.log('🔍 Metadata:', metadata);

    let sourceTransaction: Transaction;
    let destinationTransaction: Transaction | undefined;
    const isAlreadyReceived = metadata?.isAlreadyReceived;

    switch (transactionType) {
      case MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
        // Money comes IN to primary wallet, cash goes OUT from cash wallet
        sourceTransaction = await tx.transaction.create({
          data: {
            accountId: walletSelection.primaryWalletId,
            amount: calculations.principalAmount,
            direction: 'IN',
            type: 'MONEY_EXCHANGE',
            subType: transactionType,
            description: `Biometric withdrawal - Received ₹${calculations.principalAmount}`,
            billId: bill.id,
            netAmount: calculations.principalAmount,
            commission: calculations.commission,
            profit: calculations.profit,
            status: 'COMPLETED',
            metadata: {
              principalAmount: calculations.principalAmount,
              commission: calculations.commission,
              customerAmount: calculations.customerAmount,
              transactionType,
            },
          },
        });

        if (walletSelection.cashWalletId) {
          destinationTransaction = await tx.transaction.create({
            data: {
              accountId: walletSelection.cashWalletId,
              amount: calculations.customerAmount,
              direction: 'OUT',
              type: 'MONEY_EXCHANGE',
              subType: transactionType,
              description: `Cash payment to customer - ₹${calculations.customerAmount}`,
              billId: bill.id,
              netAmount: calculations.customerAmount,
              commission: 0,
              profit: 0,
              status: 'COMPLETED',
            },
          });
        }
        break;

      case MoneyExchangeType.CASH_TO_ONLINE:
        // FIXED: Customer gives cash (IN to cash wallet), we transfer to customer (OUT from primary wallet)

        // Ensure cash wallet ID is available
        if (!walletSelection.cashWalletId) {
          throw new BadRequestException(
            'Cash wallet ID is required for CASH_TO_ONLINE transactions',
          );
        }

        // Cash comes IN from customer to cash wallet
        sourceTransaction = await tx.transaction.create({
          data: {
            accountId: walletSelection.cashWalletId, // Cash wallet receives money
            amount: calculations.principalAmount,
            direction: 'IN',
            type: 'MONEY_EXCHANGE',
            subType: transactionType,
            description: `Received cash from customer - ₹${calculations.principalAmount}`,
            billId: bill.id,
            netAmount: calculations.netAmount,
            commission: calculations.commission,
            profit: calculations.profit,
            status: 'COMPLETED',
            metadata: {
              principalAmount: calculations.principalAmount,
              commission: calculations.commission,
              customerAmount: calculations.customerAmount,
              transactionType,
            },
          },
        });

        // Money goes OUT from primary wallet to customer's account
        destinationTransaction = await tx.transaction.create({
          data: {
            accountId: walletSelection.primaryWalletId,
            amount: calculations.customerAmount,
            direction: 'OUT',
            type: 'MONEY_EXCHANGE',
            subType: transactionType,
            description: `Transfer to customer GPay - ₹${calculations.customerAmount}`,
            billId: bill.id,
            netAmount: calculations.customerAmount,
            commission: 0,
            profit: 0,
            status: 'COMPLETED',
          },
        });
        break;

      case MoneyExchangeType.ONLINE_TO_CASH:
        // FIXED: Online money comes IN to primary wallet, cash goes OUT from cash wallet

        // Ensure cash wallet ID is available
        if (!walletSelection.cashWalletId) {
          throw new BadRequestException(
            'Cash wallet ID is required for ONLINE_TO_CASH transactions',
          );
        }

        // Online payment comes IN to primary wallet
        sourceTransaction = await tx.transaction.create({
          data: {
            accountId: walletSelection.primaryWalletId,
            amount: calculations.principalAmount,
            direction: 'IN',
            type: 'MONEY_EXCHANGE',
            subType: transactionType,
            description: `Received online transfer - ₹${calculations.principalAmount}`,
            billId: bill.id,
            netAmount: calculations.netAmount,
            commission: calculations.commission,
            profit: calculations.profit,
            status: 'COMPLETED',
            metadata: {
              principalAmount: calculations.principalAmount,
              commission: calculations.commission,
              customerAmount: calculations.customerAmount,
              transactionType,
            },
          },
        });

        // Cash goes OUT from cash wallet to customer
        destinationTransaction = await tx.transaction.create({
          data: {
            accountId: walletSelection.cashWalletId,
            amount: calculations.customerAmount,
            direction: 'OUT',
            type: 'MONEY_EXCHANGE',
            subType: transactionType,
            description: `Cash payment to customer - ₹${calculations.customerAmount}`,
            billId: bill.id,
            netAmount: calculations.customerAmount,
            commission: 0,
            profit: 0,
            status: 'COMPLETED',
          },
        });
        break;

      case MoneyExchangeType.GPAY_TRANSFER:
        // Money transfer - debit from primary wallet
        sourceTransaction = await tx.transaction.create({
          data: {
            accountId: walletSelection.primaryWalletId,
            amount: calculations.totalDebit,
            direction: 'OUT',
            type: 'MONEY_EXCHANGE',
            subType: transactionType,
            description: `GPay transfer - ₹${calculations.customerAmount}`,
            billId: bill.id,
            netAmount: calculations.netAmount,
            commission: calculations.commission,
            profit: calculations.profit,
            status: 'COMPLETED',
            metadata: {
              principalAmount: calculations.principalAmount,
              commission: calculations.commission,
              customerAmount: calculations.customerAmount,
              transactionType,
            },
          },
        });
        break;

      case MoneyExchangeType.ONLINE_TO_ONLINE:
        if (!isAlreadyReceived && !walletSelection.secondaryWalletId) {
          throw new BadRequestException(
            'Secondary wallet ID is required for online to online transfers when money is not already received',
          );
        }

        if (isAlreadyReceived) {
          // If money is already received, only create OUTGOING transaction
          sourceTransaction = await tx.transaction.create({
            data: {
              accountId: walletSelection.primaryWalletId,
              amount: calculations.customerAmount,
              direction: 'OUT',
              type: 'MONEY_EXCHANGE',
              subType: transactionType,
              description: `Transfer to customer - ₹${calculations.customerAmount} (money already received)`,
              billId: bill.id,
              netAmount: calculations.customerAmount,
              commission: calculations.commission,
              profit: calculations.profit,
              status: 'COMPLETED',
              metadata: {
                principalAmount: calculations.principalAmount,
                commission: calculations.commission,
                customerAmount: calculations.customerAmount,
                transactionType,
                isAlreadyReceived: true,
              },
            },
          });
        } else {
          // Normal flow: Incoming and outgoing transactions
          // Step 1: Money comes IN to primary wallet (from customer)
          sourceTransaction = await tx.transaction.create({
            data: {
              accountId: walletSelection.primaryWalletId,
              amount: calculations.principalAmount,
              direction: 'IN',
              type: 'MONEY_EXCHANGE',
              subType: transactionType,
              description: `Received online transfer - ₹${calculations.principalAmount}`,
              billId: bill.id,
              netAmount: calculations.netAmount,
              commission: calculations.commission,
              profit: calculations.profit,
              status: 'COMPLETED',
              metadata: {
                principalAmount: calculations.principalAmount,
                commission: calculations.commission,
                customerAmount: calculations.customerAmount,
                transactionType,
              },
            },
          });

          // Step 2: Money goes OUT from primary wallet to secondary wallet
          destinationTransaction = await tx.transaction.create({
            data: {
              accountId: walletSelection.secondaryWalletId,
              amount: calculations.customerAmount,
              direction: 'OUT',
              type: 'MONEY_EXCHANGE',
              subType: transactionType,
              description: `Transfer to customer account - ₹${calculations.customerAmount}`,
              billId: bill.id,
              netAmount: calculations.customerAmount,
              commission: 0,
              profit: 0,
              status: 'COMPLETED',
              relatedAccountId: walletSelection.primaryWalletId,
            },
          });
        }
        break;

      default:
        throw new BadRequestException(
          `Unsupported transaction type: ${transactionType}`,
        );
    }

    return { sourceTransaction, destinationTransaction };
  }

  private async handleCommissionTransactions(
    tx: any,
    bill: Bill,
    calculations: MoneyExchangeCalculationDto,
    commissionDistribution: CommissionDistributionDto,
    walletSelection: WalletSelectionDto,
    wallets: any,
    transactionType: MoneyExchangeType,
  ): Promise<Transaction[]> {
    const commissionTransactions: Transaction[] = [];

    switch (commissionDistribution.method) {
      case CommissionDistributionMethod.DEDUCT_FROM_AMOUNT:
        // Commission already deducted, no separate transaction needed
        break;

      case CommissionDistributionMethod.SEPARATE_ONLINE:
        if (
          walletSelection.commissionWalletId &&
          calculations.digitalCommission > 0
        ) {
          const commissionTx = await tx.transaction.create({
            data: {
              accountId: walletSelection.commissionWalletId,
              amount: calculations.digitalCommission,
              direction: 'IN',
              type: 'COMMISSION',
              subType: 'DIGITAL_COMMISSION',
              description: `Digital commission from ${this.getServiceName(transactionType)}`,
              billId: bill.id,
              netAmount: calculations.digitalCommission,
              commission: 0,
              profit: calculations.digitalCommission,
              status: 'COMPLETED',
            },
          });
          commissionTransactions.push(commissionTx);
        }
        break;

      case CommissionDistributionMethod.SEPARATE_CASH:
        if (calculations.cashCommission > 0) {
          const cashCommissionWalletId =
            commissionDistribution.cashCommissionWalletId ||
            walletSelection.cashWalletId;

          if (cashCommissionWalletId) {
            const cashCommissionTx = await tx.transaction.create({
              data: {
                accountId: cashCommissionWalletId,
                amount: calculations.cashCommission,
                direction: 'IN',
                type: 'COMMISSION',
                subType: 'CASH_COMMISSION',
                description: `Cash commission from ${this.getServiceName(transactionType)}`,
                billId: bill.id,
                netAmount: calculations.cashCommission,
                commission: 0,
                profit: calculations.cashCommission,
                status: 'COMPLETED',
                metadata: { isCashCommission: true },
              },
            });
            commissionTransactions.push(cashCommissionTx);
          }
        }
        break;

      case CommissionDistributionMethod.SPLIT:
        // Handle digital commission
        if (
          walletSelection.commissionWalletId &&
          calculations.digitalCommission > 0
        ) {
          const digitalTx = await tx.transaction.create({
            data: {
              accountId: walletSelection.commissionWalletId,
              amount: calculations.digitalCommission,
              direction: 'IN',
              type: 'COMMISSION',
              subType: 'DIGITAL_COMMISSION',
              description: `Digital commission from ${this.getServiceName(transactionType)}`,
              billId: bill.id,
              netAmount: calculations.digitalCommission,
              commission: 0,
              profit: calculations.digitalCommission,
              status: 'COMPLETED',
            },
          });
          commissionTransactions.push(digitalTx);
        }

        // Handle cash commission
        if (calculations.cashCommission > 0) {
          const cashCommissionWalletId =
            commissionDistribution.cashCommissionWalletId ||
            walletSelection.cashWalletId;

          if (cashCommissionWalletId) {
            const cashTx = await tx.transaction.create({
              data: {
                accountId: cashCommissionWalletId,
                amount: calculations.cashCommission,
                direction: 'IN',
                type: 'COMMISSION',
                subType: 'CASH_COMMISSION',
                description: `Cash commission from ${this.getServiceName(transactionType)}`,
                billId: bill.id,
                netAmount: calculations.cashCommission,
                commission: 0,
                profit: calculations.cashCommission,
                status: 'COMPLETED',
                metadata: { isCashCommission: true },
              },
            });
            commissionTransactions.push(cashTx);
          }
        }
        break;
    }

    return commissionTransactions;
  }

  private async updateWalletBalances(
    tx: any,
    transactionType: MoneyExchangeType,
    calculations: MoneyExchangeCalculationDto,
    walletSelection: WalletSelectionDto,
    wallets: any,
    commissionTransactions: Transaction[],
    metadata?: any,
  ) {
    const walletBalances: any = {};
    const updates: Promise<any>[] = [];

    // FIXED: Calculate balance changes based on transaction type
    let primaryBalanceChange = 0;
    let cashBalanceChange = 0;
    let secondaryBalanceChange = 0;
    const isAlreadyReceived = metadata?.isAlreadyReceived;

    switch (transactionType) {
      case MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
        // Primary: IN (receive money), Cash: OUT (give cash)
        primaryBalanceChange = calculations.principalAmount;
        cashBalanceChange = -calculations.customerAmount;
        break;

      case MoneyExchangeType.CASH_TO_ONLINE:
        // Primary: OUT (send to customer), Cash: IN (receive cash)
        primaryBalanceChange = -calculations.customerAmount;
        cashBalanceChange = calculations.principalAmount;
        break;

      case MoneyExchangeType.ONLINE_TO_CASH:
        // Primary: IN (receive online), Cash: OUT (give cash)
        primaryBalanceChange = calculations.principalAmount;
        cashBalanceChange = -calculations.customerAmount;
        break;

      case MoneyExchangeType.GPAY_TRANSFER:
        // Primary: OUT (send to customer)
        primaryBalanceChange = -calculations.totalDebit;
        break;

      case MoneyExchangeType.ONLINE_TO_ONLINE:
        if (isAlreadyReceived) {
          // Only deduct from primary wallet (money already there)
          primaryBalanceChange = -calculations.customerAmount;
        } else {
          // Normal flow
          primaryBalanceChange = calculations.principalAmount - calculations.customerAmount;
          secondaryBalanceChange = calculations.customerAmount;
        }
        break;
    }

    // Update primary wallet
    if (primaryBalanceChange !== 0) {
      updates.push(
        tx.account.update({
          where: { id: walletSelection.primaryWalletId },
          data: {
            balance: { increment: primaryBalanceChange },
          },
        }),
      );
      walletBalances.primaryWallet = {
        id: walletSelection.primaryWalletId,
        oldBalance: wallets.primary.balance,
        newBalance: wallets.primary.balance + primaryBalanceChange,
      };
    }

    // Update cash wallet
    if (walletSelection.cashWalletId && wallets.cash) {
      // Add cash commission to cash wallet balance
      const cashCommission = commissionTransactions
        .filter(
          (tx) =>
            tx.subType === 'CASH_COMMISSION' &&
            tx.accountId === walletSelection.cashWalletId,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalCashChange = cashBalanceChange + cashCommission;

      if (totalCashChange !== 0) {
        updates.push(
          tx.account.update({
            where: { id: walletSelection.cashWalletId },
            data: {
              balance: { increment: totalCashChange },
            },
          }),
        );
        walletBalances.cashWallet = {
          id: walletSelection.cashWalletId,
          oldBalance: wallets.cash.balance,
          newBalance: wallets.cash.balance + totalCashChange,
        };
      }
    }

    // Update commission wallet for digital commissions
    if (walletSelection.commissionWalletId && wallets.commission) {
      const digitalCommission = commissionTransactions
        .filter(
          (tx) =>
            tx.subType === 'DIGITAL_COMMISSION' &&
            tx.accountId === walletSelection.commissionWalletId,
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (digitalCommission > 0) {
        updates.push(
          tx.account.update({
            where: { id: walletSelection.commissionWalletId },
            data: {
              balance: { increment: digitalCommission },
            },
          }),
        );
        walletBalances.commissionWallet = {
          id: walletSelection.commissionWalletId,
          oldBalance: wallets.commission.balance,
          newBalance: wallets.commission.balance + digitalCommission,
        };
      }
    }

    // Update secondary wallet for ONLINE_TO_ONLINE when not already received
    if (
      transactionType === MoneyExchangeType.ONLINE_TO_ONLINE && 
      !isAlreadyReceived &&
      walletSelection.secondaryWalletId && 
      wallets.secondary
    ) {
      if (secondaryBalanceChange !== 0) {
        updates.push(
          tx.account.update({
            where: { id: walletSelection.secondaryWalletId },
            data: {
              balance: { increment: secondaryBalanceChange },
            },
          }),
        );
        walletBalances.secondaryWallet = {
          id: walletSelection.secondaryWalletId,
          oldBalance: wallets.secondary.balance,
          newBalance: wallets.secondary.balance + secondaryBalanceChange,
        };
      }
    }

    // Execute all balance updates
    await Promise.all(updates);

    console.log('✅ Updated wallet balances:', walletBalances);
    return walletBalances;
  }

  private getServiceName(transactionType: MoneyExchangeType): string {
    const names: Record<MoneyExchangeType, string> = {
      [MoneyExchangeType.BIOMETRIC_WITHDRAWAL]: 'Biometric Cash Withdrawal',
      [MoneyExchangeType.CASH_TO_ONLINE]: 'Cash to Online Transfer',
      [MoneyExchangeType.ONLINE_TO_CASH]: 'Online to Cash Transfer',
      [MoneyExchangeType.ONLINE_TO_ONLINE]: 'Online to Online Transfer',
      [MoneyExchangeType.GPAY_TRANSFER]: 'GPay Money Transfer',
      [MoneyExchangeType.MONEY_EXCHANGE]: 'Money Exchange',
    };
    return names[transactionType] || 'Money Exchange';
  }

  private getPaymentMode(transactionType: MoneyExchangeType): string {
    const modes: Record<MoneyExchangeType, string> = {
      [MoneyExchangeType.BIOMETRIC_WITHDRAWAL]: 'MIXED',
      [MoneyExchangeType.CASH_TO_ONLINE]: 'MIXED',
      [MoneyExchangeType.ONLINE_TO_CASH]: 'MIXED',
      [MoneyExchangeType.ONLINE_TO_ONLINE]: 'ONLINE',
      [MoneyExchangeType.GPAY_TRANSFER]: 'ONLINE',
      [MoneyExchangeType.MONEY_EXCHANGE]: 'MIXED',
    };
    return modes[transactionType] || 'CASH';
  }

  private getCommissionDescription(
    method: CommissionDistributionMethod,
    commission: number,
    cashCommission: number,
    digitalCommission: number,
  ): string {
    switch (method) {
      case CommissionDistributionMethod.DEDUCT_FROM_AMOUNT:
        return `Commission ₹${commission} deducted from amount`;
      case CommissionDistributionMethod.SEPARATE_ONLINE:
        return `Commission ₹${commission} collected online`;
      case CommissionDistributionMethod.SEPARATE_CASH:
        return `Commission ₹${commission} collected in cash`;
      case CommissionDistributionMethod.SPLIT:
        return `Commission split: ₹${cashCommission} cash + ₹${digitalCommission} online`;
      default:
        return `Commission: ₹${commission}`;
    }
  }

  private async generateBillNumber(): Promise<string> {
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

  // Simplified money exchange method
  async createSimplifiedMoneyExchange(
    dto: SimplifiedMoneyExchangeDto,
  ): Promise<SimplifiedMoneyExchangeResponseDto> {
    console.log('🔍 Creating simplified money exchange:', dto);

    // Convert simplified DTO to full DTO
    const commissionDistribution: CommissionDistributionDto = {
      method: dto.commissionMethod,
      cashCommission: dto.splitCashAmount || 0,
      digitalCommission: 0,
      digitalCommissionWalletId: dto.commissionWalletId,
      cashCommissionWalletId: dto.cashCommissionWalletId,
    };

    // Create metadata for already received flag
    const metadata = {
      isAlreadyReceived: dto.metadata?.isAlreadyReceived || false,
    };

    // FIXED: Ensure proper wallet mapping with validation
    const walletSelection: WalletSelectionDto = {
      primaryWalletId: dto.ourWalletId,
      cashWalletId: dto.cashWalletId,
      commissionWalletId: dto.commissionWalletId,
      secondaryWalletId: this.getSecondaryWalletId(
        dto.transactionType,
        dto.cashWalletId,
        dto.customerWalletId,
        metadata,
      ),
    };

    console.log('🔍 Mapped wallet selection:', walletSelection);
    console.log('🔍 Metadata:', metadata);

    const createMoneyExchangeDto: CreateMoneyExchangeDto = {
      transactionType: dto.transactionType,
      principalAmount: dto.amount,
      commissionType: dto.commissionType,
      commissionValue: dto.commissionValue,
      commissionDistribution,
      walletSelection,
      customerPhone: dto.customerPhone,
      customerName: dto.customerName,
      notes: dto.notes,
      metadata,
    };

    const result = await this.createMoneyExchange(createMoneyExchangeDto);

    return this.transformToSimplifiedResponse(result, dto);
  }

  private getSecondaryWalletId(
    transactionType: MoneyExchangeType,
    cashWalletId?: string,
    customerWalletId?: string,
    metadata?: any,
  ): string | undefined {
    const isAlreadyReceived = metadata?.isAlreadyReceived;
    
    switch (transactionType) {
      case MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
      case MoneyExchangeType.ONLINE_TO_CASH:
        return cashWalletId;
      case MoneyExchangeType.CASH_TO_ONLINE:
        return customerWalletId;
      case MoneyExchangeType.ONLINE_TO_ONLINE:
        // For already received, we don't need secondary wallet
        return isAlreadyReceived ? undefined : customerWalletId;
      default:
        return undefined;
    }
  }

  private transformToSimplifiedResponse(
    result: MoneyExchangeResult,
    originalDto: SimplifiedMoneyExchangeDto,
  ): SimplifiedMoneyExchangeResponseDto {
    const walletBalances: any = {
      ourWallet: {
        id: result.walletBalances.primaryWallet.id,
        name: 'Our Wallet',
        oldBalance: result.walletBalances.primaryWallet.oldBalance,
        newBalance: result.walletBalances.primaryWallet.newBalance,
      },
    };

    if (originalDto.cashWalletId && result.walletBalances.cashWallet) {
      walletBalances.cashWallet = {
        id: originalDto.cashWalletId,
        name: 'Cash Wallet',
        oldBalance: result.walletBalances.cashWallet.oldBalance,
        newBalance: result.walletBalances.cashWallet.newBalance,
      };
    }

    if (originalDto.customerWalletId && result.walletBalances.secondaryWallet) {
      walletBalances.customerWallet = {
        id: originalDto.customerWalletId,
        name: 'Customer Wallet',
        oldBalance: result.walletBalances.secondaryWallet.oldBalance,
        newBalance: result.walletBalances.secondaryWallet.newBalance,
      };
    }

    if (
      originalDto.commissionWalletId &&
      result.walletBalances.commissionWallet
    ) {
      walletBalances.commissionWallet = {
        id: originalDto.commissionWalletId,
        name: 'Commission Wallet',
        oldBalance: result.walletBalances.commissionWallet.oldBalance,
        newBalance: result.walletBalances.commissionWallet.newBalance,
      };
    }

    return {
      bill: result.bill,
      calculations: result.calculations,
      transactions: [
        result.sourceTransaction,
        ...(result.destinationTransaction
          ? [result.destinationTransaction]
          : []),
        ...result.commissionTransactions,
      ],
      walletBalances,
    };
  }
}