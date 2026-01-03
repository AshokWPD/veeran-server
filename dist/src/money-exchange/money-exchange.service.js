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
exports.MoneyExchangeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
const money_exchange_dto_1 = require("../bill/dto/money-exchange.dto");
let MoneyExchangeService = class MoneyExchangeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMoneyExchange(createMoneyExchangeDto) {
        const { transactionType, principalAmount, commissionType, commissionValue, commissionDistribution, walletSelection, customerPhone, customerName, notes, metadata, } = createMoneyExchangeDto;
        console.log('🔍 Creating money exchange:', {
            transactionType,
            principalAmount,
            walletSelection,
            metadata,
        });
        const wallets = await this.validateWallets(walletSelection, transactionType, metadata);
        const calculations = this.calculateMoneyExchangeAmounts(principalAmount, commissionType, commissionValue, commissionDistribution, transactionType);
        await this.validateBalances(transactionType, calculations, wallets, walletSelection, metadata);
        return this.prisma.$transaction(async (tx) => {
            const billNumber = await this.generateBillNumber();
            const commissionDistributionJson = this.serializeCommissionDistribution(commissionDistribution);
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
            const { sourceTransaction, destinationTransaction } = await this.handleMainTransactions(tx, bill, transactionType, calculations, walletSelection, wallets, metadata);
            const commissionTransactions = await this.handleCommissionTransactions(tx, bill, calculations, commissionDistribution, walletSelection, wallets, transactionType);
            const walletBalances = await this.updateWalletBalances(tx, transactionType, calculations, walletSelection, wallets, commissionTransactions, metadata);
            return {
                transaction: sourceTransaction,
                sourceTransaction,
                destinationTransaction,
                commissionTransactions,
                calculations,
                bill,
                walletBalances,
            };
        });
    }
    serializeCommissionDistribution(commissionDistribution) {
        return {
            method: commissionDistribution.method,
            cashCommission: commissionDistribution.cashCommission || 0,
            digitalCommission: commissionDistribution.digitalCommission || 0,
            digitalCommissionWalletId: commissionDistribution.digitalCommissionWalletId,
            cashCommissionWalletId: commissionDistribution.cashCommissionWalletId,
            splitRatio: commissionDistribution.splitRatio,
        };
    }
    async validateWallets(walletSelection, transactionType, metadata) {
        console.log('🔍 Validating wallets:', walletSelection);
        console.log('🔍 Metadata:', metadata);
        if (!walletSelection.primaryWalletId) {
            throw new common_1.BadRequestException('Primary wallet ID is required');
        }
        const wallets = {
            primary: await this.validateWallet(walletSelection.primaryWalletId),
        };
        const isAlreadyReceived = metadata?.isAlreadyReceived;
        if (transactionType === money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE ||
            transactionType === money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH) {
            if (!walletSelection.cashWalletId) {
                throw new common_1.BadRequestException('Cash wallet ID is required for this transaction type');
            }
            wallets.cash = await this.validateWallet(walletSelection.cashWalletId);
        }
        else if (transactionType === money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE) {
            if (!isAlreadyReceived && !walletSelection.secondaryWalletId) {
                throw new common_1.BadRequestException('Secondary (customer) wallet ID is required for online to online transfers when money is not already received');
            }
            if (!isAlreadyReceived && walletSelection.secondaryWalletId) {
                wallets.secondary = await this.validateWallet(walletSelection.secondaryWalletId);
            }
        }
        else if (walletSelection.cashWalletId) {
            wallets.cash = await this.validateWallet(walletSelection.cashWalletId);
        }
        if (walletSelection.commissionWalletId) {
            wallets.commission = await this.validateWallet(walletSelection.commissionWalletId);
        }
        if (walletSelection.secondaryWalletId && !wallets.secondary) {
            wallets.secondary = await this.validateWallet(walletSelection.secondaryWalletId);
        }
        console.log('✅ Validated wallets:', Object.keys(wallets));
        return wallets;
    }
    async validateWallet(walletId) {
        const wallet = await this.prisma.account.findUnique({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet with ID ${walletId} not found`);
        }
        if (!wallet.isActive) {
            throw new common_1.BadRequestException(`Wallet ${wallet.name} is not active`);
        }
        return wallet;
    }
    calculateMoneyExchangeAmounts(principalAmount, commissionType, commissionValue, commissionDistribution, transactionType) {
        const commission = commissionType === money_exchange_dto_1.CommissionType.PERCENTAGE
            ? (principalAmount * commissionValue) / 100
            : commissionValue;
        let customerAmount = principalAmount;
        let totalDebit = principalAmount;
        let cashCommission = 0;
        let digitalCommission = 0;
        let netAmount = principalAmount;
        switch (commissionDistribution.method) {
            case money_exchange_dto_1.CommissionDistributionMethod.DEDUCT_FROM_AMOUNT:
                customerAmount = principalAmount - commission;
                totalDebit = principalAmount;
                digitalCommission = commission;
                netAmount = customerAmount;
                break;
            case money_exchange_dto_1.CommissionDistributionMethod.SEPARATE_ONLINE:
                customerAmount = principalAmount;
                totalDebit = principalAmount + commission;
                digitalCommission = commission;
                netAmount = principalAmount;
                break;
            case money_exchange_dto_1.CommissionDistributionMethod.SEPARATE_CASH:
                customerAmount = principalAmount;
                totalDebit = principalAmount;
                cashCommission = commission;
                netAmount = principalAmount;
                break;
            case money_exchange_dto_1.CommissionDistributionMethod.SPLIT:
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
                description: this.getCommissionDescription(commissionDistribution.method, commission, cashCommission, digitalCommission),
                customerReceives: customerAmount,
                weCollect: commission,
                walletImpact: totalDebit,
            },
        };
    }
    async validateBalances(transactionType, calculations, wallets, walletSelection, metadata) {
        console.log('🔍 Validating balances for:', transactionType);
        const isAlreadyReceived = metadata?.isAlreadyReceived;
        switch (transactionType) {
            case money_exchange_dto_1.MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
                if (wallets.cash &&
                    calculations.customerAmount > wallets.cash.balance) {
                    throw new common_1.BadRequestException(`Insufficient cash balance. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.cash.balance}`);
                }
                break;
            case money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE:
                if (calculations.customerAmount > wallets.primary.balance) {
                    throw new common_1.BadRequestException(`Insufficient balance in primary wallet. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.primary.balance}`);
                }
                break;
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH:
                if (calculations.customerAmount > wallets.cash.balance) {
                    throw new common_1.BadRequestException(`Insufficient cash balance. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.cash.balance}`);
                }
                break;
            case money_exchange_dto_1.MoneyExchangeType.GPAY_TRANSFER:
                if (calculations.totalDebit > wallets.primary.balance) {
                    throw new common_1.BadRequestException(`Insufficient balance. Required: ₹${calculations.totalDebit}, Available: ₹${wallets.primary.balance}`);
                }
                break;
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE:
                if (!isAlreadyReceived && calculations.customerAmount > wallets.primary.balance) {
                    throw new common_1.BadRequestException(`Insufficient balance in primary wallet. Required: ₹${calculations.customerAmount}, Available: ₹${wallets.primary.balance}`);
                }
                break;
        }
    }
    async handleMainTransactions(tx, bill, transactionType, calculations, walletSelection, wallets, metadata) {
        console.log('🔍 Handling main transactions for:', transactionType);
        console.log('🔍 Wallet selection:', walletSelection);
        console.log('🔍 Metadata:', metadata);
        let sourceTransaction;
        let destinationTransaction;
        const isAlreadyReceived = metadata?.isAlreadyReceived;
        switch (transactionType) {
            case money_exchange_dto_1.MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
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
            case money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE:
                if (!walletSelection.cashWalletId) {
                    throw new common_1.BadRequestException('Cash wallet ID is required for CASH_TO_ONLINE transactions');
                }
                sourceTransaction = await tx.transaction.create({
                    data: {
                        accountId: walletSelection.cashWalletId,
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
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH:
                if (!walletSelection.cashWalletId) {
                    throw new common_1.BadRequestException('Cash wallet ID is required for ONLINE_TO_CASH transactions');
                }
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
            case money_exchange_dto_1.MoneyExchangeType.GPAY_TRANSFER:
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
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE:
                if (!isAlreadyReceived && !walletSelection.secondaryWalletId) {
                    throw new common_1.BadRequestException('Secondary wallet ID is required for online to online transfers when money is not already received');
                }
                if (isAlreadyReceived) {
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
                }
                else {
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
                throw new common_1.BadRequestException(`Unsupported transaction type: ${transactionType}`);
        }
        return { sourceTransaction, destinationTransaction };
    }
    async handleCommissionTransactions(tx, bill, calculations, commissionDistribution, walletSelection, wallets, transactionType) {
        const commissionTransactions = [];
        switch (commissionDistribution.method) {
            case money_exchange_dto_1.CommissionDistributionMethod.DEDUCT_FROM_AMOUNT:
                break;
            case money_exchange_dto_1.CommissionDistributionMethod.SEPARATE_ONLINE:
                if (walletSelection.commissionWalletId &&
                    calculations.digitalCommission > 0) {
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
            case money_exchange_dto_1.CommissionDistributionMethod.SEPARATE_CASH:
                if (calculations.cashCommission > 0) {
                    const cashCommissionWalletId = commissionDistribution.cashCommissionWalletId ||
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
            case money_exchange_dto_1.CommissionDistributionMethod.SPLIT:
                if (walletSelection.commissionWalletId &&
                    calculations.digitalCommission > 0) {
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
                if (calculations.cashCommission > 0) {
                    const cashCommissionWalletId = commissionDistribution.cashCommissionWalletId ||
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
    async updateWalletBalances(tx, transactionType, calculations, walletSelection, wallets, commissionTransactions, metadata) {
        const walletBalances = {};
        const updates = [];
        let primaryBalanceChange = 0;
        let cashBalanceChange = 0;
        let secondaryBalanceChange = 0;
        const isAlreadyReceived = metadata?.isAlreadyReceived;
        switch (transactionType) {
            case money_exchange_dto_1.MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
                primaryBalanceChange = calculations.principalAmount;
                cashBalanceChange = -calculations.customerAmount;
                break;
            case money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE:
                primaryBalanceChange = -calculations.customerAmount;
                cashBalanceChange = calculations.principalAmount;
                break;
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH:
                primaryBalanceChange = calculations.principalAmount;
                cashBalanceChange = -calculations.customerAmount;
                break;
            case money_exchange_dto_1.MoneyExchangeType.GPAY_TRANSFER:
                primaryBalanceChange = -calculations.totalDebit;
                break;
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE:
                if (isAlreadyReceived) {
                    primaryBalanceChange = -calculations.customerAmount;
                }
                else {
                    primaryBalanceChange = calculations.principalAmount - calculations.customerAmount;
                    secondaryBalanceChange = calculations.customerAmount;
                }
                break;
        }
        if (primaryBalanceChange !== 0) {
            updates.push(tx.account.update({
                where: { id: walletSelection.primaryWalletId },
                data: {
                    balance: { increment: primaryBalanceChange },
                },
            }));
            walletBalances.primaryWallet = {
                id: walletSelection.primaryWalletId,
                oldBalance: wallets.primary.balance,
                newBalance: wallets.primary.balance + primaryBalanceChange,
            };
        }
        if (walletSelection.cashWalletId && wallets.cash) {
            const cashCommission = commissionTransactions
                .filter((tx) => tx.subType === 'CASH_COMMISSION' &&
                tx.accountId === walletSelection.cashWalletId)
                .reduce((sum, tx) => sum + tx.amount, 0);
            const totalCashChange = cashBalanceChange + cashCommission;
            if (totalCashChange !== 0) {
                updates.push(tx.account.update({
                    where: { id: walletSelection.cashWalletId },
                    data: {
                        balance: { increment: totalCashChange },
                    },
                }));
                walletBalances.cashWallet = {
                    id: walletSelection.cashWalletId,
                    oldBalance: wallets.cash.balance,
                    newBalance: wallets.cash.balance + totalCashChange,
                };
            }
        }
        if (walletSelection.commissionWalletId && wallets.commission) {
            const digitalCommission = commissionTransactions
                .filter((tx) => tx.subType === 'DIGITAL_COMMISSION' &&
                tx.accountId === walletSelection.commissionWalletId)
                .reduce((sum, tx) => sum + tx.amount, 0);
            if (digitalCommission > 0) {
                updates.push(tx.account.update({
                    where: { id: walletSelection.commissionWalletId },
                    data: {
                        balance: { increment: digitalCommission },
                    },
                }));
                walletBalances.commissionWallet = {
                    id: walletSelection.commissionWalletId,
                    oldBalance: wallets.commission.balance,
                    newBalance: wallets.commission.balance + digitalCommission,
                };
            }
        }
        if (transactionType === money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE &&
            !isAlreadyReceived &&
            walletSelection.secondaryWalletId &&
            wallets.secondary) {
            if (secondaryBalanceChange !== 0) {
                updates.push(tx.account.update({
                    where: { id: walletSelection.secondaryWalletId },
                    data: {
                        balance: { increment: secondaryBalanceChange },
                    },
                }));
                walletBalances.secondaryWallet = {
                    id: walletSelection.secondaryWalletId,
                    oldBalance: wallets.secondary.balance,
                    newBalance: wallets.secondary.balance + secondaryBalanceChange,
                };
            }
        }
        await Promise.all(updates);
        console.log('✅ Updated wallet balances:', walletBalances);
        return walletBalances;
    }
    getServiceName(transactionType) {
        const names = {
            [money_exchange_dto_1.MoneyExchangeType.BIOMETRIC_WITHDRAWAL]: 'Biometric Cash Withdrawal',
            [money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE]: 'Cash to Online Transfer',
            [money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH]: 'Online to Cash Transfer',
            [money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE]: 'Online to Online Transfer',
            [money_exchange_dto_1.MoneyExchangeType.GPAY_TRANSFER]: 'GPay Money Transfer',
            [money_exchange_dto_1.MoneyExchangeType.MONEY_EXCHANGE]: 'Money Exchange',
        };
        return names[transactionType] || 'Money Exchange';
    }
    getPaymentMode(transactionType) {
        const modes = {
            [money_exchange_dto_1.MoneyExchangeType.BIOMETRIC_WITHDRAWAL]: 'MIXED',
            [money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE]: 'MIXED',
            [money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH]: 'MIXED',
            [money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE]: 'ONLINE',
            [money_exchange_dto_1.MoneyExchangeType.GPAY_TRANSFER]: 'ONLINE',
            [money_exchange_dto_1.MoneyExchangeType.MONEY_EXCHANGE]: 'MIXED',
        };
        return modes[transactionType] || 'CASH';
    }
    getCommissionDescription(method, commission, cashCommission, digitalCommission) {
        switch (method) {
            case money_exchange_dto_1.CommissionDistributionMethod.DEDUCT_FROM_AMOUNT:
                return `Commission ₹${commission} deducted from amount`;
            case money_exchange_dto_1.CommissionDistributionMethod.SEPARATE_ONLINE:
                return `Commission ₹${commission} collected online`;
            case money_exchange_dto_1.CommissionDistributionMethod.SEPARATE_CASH:
                return `Commission ₹${commission} collected in cash`;
            case money_exchange_dto_1.CommissionDistributionMethod.SPLIT:
                return `Commission split: ₹${cashCommission} cash + ₹${digitalCommission} online`;
            default:
                return `Commission: ₹${commission}`;
        }
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
    async createSimplifiedMoneyExchange(dto) {
        console.log('🔍 Creating simplified money exchange:', dto);
        const commissionDistribution = {
            method: dto.commissionMethod,
            cashCommission: dto.splitCashAmount || 0,
            digitalCommission: 0,
            digitalCommissionWalletId: dto.commissionWalletId,
            cashCommissionWalletId: dto.cashCommissionWalletId,
        };
        const metadata = {
            isAlreadyReceived: dto.metadata?.isAlreadyReceived || false,
        };
        const walletSelection = {
            primaryWalletId: dto.ourWalletId,
            cashWalletId: dto.cashWalletId,
            commissionWalletId: dto.commissionWalletId,
            secondaryWalletId: this.getSecondaryWalletId(dto.transactionType, dto.cashWalletId, dto.customerWalletId, metadata),
        };
        console.log('🔍 Mapped wallet selection:', walletSelection);
        console.log('🔍 Metadata:', metadata);
        const createMoneyExchangeDto = {
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
    getSecondaryWalletId(transactionType, cashWalletId, customerWalletId, metadata) {
        const isAlreadyReceived = metadata?.isAlreadyReceived;
        switch (transactionType) {
            case money_exchange_dto_1.MoneyExchangeType.BIOMETRIC_WITHDRAWAL:
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_CASH:
                return cashWalletId;
            case money_exchange_dto_1.MoneyExchangeType.CASH_TO_ONLINE:
                return customerWalletId;
            case money_exchange_dto_1.MoneyExchangeType.ONLINE_TO_ONLINE:
                return isAlreadyReceived ? undefined : customerWalletId;
            default:
                return undefined;
        }
    }
    transformToSimplifiedResponse(result, originalDto) {
        const walletBalances = {
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
        if (originalDto.commissionWalletId &&
            result.walletBalances.commissionWallet) {
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
};
exports.MoneyExchangeService = MoneyExchangeService;
exports.MoneyExchangeService = MoneyExchangeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MoneyExchangeService);
//# sourceMappingURL=money-exchange.service.js.map