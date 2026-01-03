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
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
const adjust_balance_dto_1 = require("./dto/adjust-balance.dto");
let AccountService = class AccountService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { page = 1, limit = 10, type, search, sortBy = 'name', sortOrder = 'asc', isActive, } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (type) {
            where.type = type;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { accountNumber: { contains: search } },
                { holderName: { contains: search } },
            ];
        }
        const orderBy = {};
        if (sortBy === 'balance') {
            orderBy.balance = sortOrder;
        }
        else if (sortBy === 'name') {
            orderBy.name = sortOrder;
        }
        else if (sortBy === 'type') {
            orderBy.type = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [data, total] = await Promise.all([
            this.prisma.account.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
            this.prisma.account.count({ where }),
        ]);
        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        };
    }
    async findOne(id) {
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        return account;
    }
    async create(data) {
        return this.prisma.account.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.account.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.account.delete({ where: { id } });
    }
    async getWalletAnalytics(query) {
        const { startDate, endDate } = query;
        const where = {};
        const transactionWhere = {};
        if (startDate || endDate) {
            transactionWhere.createdAt = {};
            if (startDate)
                transactionWhere.createdAt.gte = new Date(startDate);
            if (endDate)
                transactionWhere.createdAt.lte = new Date(endDate);
        }
        try {
            const accounts = await this.prisma.account.findMany({
                where,
                include: {
                    transactions: {
                        where: transactionWhere,
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (accounts.length === 0) {
                return {
                    totalBalance: 0,
                    totalWallets: 0,
                    activeWallets: 0,
                    highestBalance: null,
                    balanceByType: {},
                    walletDistribution: [],
                    recentTransactions: [],
                };
            }
            const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
            const totalWallets = accounts.length;
            const activeWallets = accounts.filter((account) => account.isActive).length;
            const highestBalanceAccount = accounts.reduce((prev, current) => (prev.balance || 0) > (current.balance || 0) ? prev : current, accounts[0]);
            const balanceByType = accounts.reduce((acc, account) => {
                const type = account.type || 'Unknown';
                acc[type] = (acc[type] || 0) + (account.balance || 0);
                return acc;
            }, {});
            const walletDistribution = Object.entries(accounts.reduce((acc, account) => {
                const type = account.type || 'Unknown';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {})).map(([type, count]) => ({
                type,
                count,
                percentage: totalWallets > 0 ? Math.round((count / totalWallets) * 100) : 0,
            }));
            const recentTransactions = await this.prisma.transaction.findMany({
                where: transactionWhere,
                include: {
                    account: true,
                    relatedAccount: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            return {
                totalBalance,
                totalWallets,
                activeWallets,
                highestBalance: highestBalanceAccount?.name || null,
                highestBalanceAmount: highestBalanceAccount?.balance || 0,
                balanceByType,
                walletDistribution,
                recentTransactions: recentTransactions.map((tx) => ({
                    id: tx.id,
                    accountName: tx.account?.name || 'Unknown Account',
                    type: tx.type,
                    subType: tx.subType,
                    amount: tx.amount || 0,
                    direction: tx.direction,
                    description: tx.description,
                    createdAt: tx.createdAt,
                    relatedAccountName: tx.relatedAccount?.name,
                })),
            };
        }
        catch (error) {
            console.error('Error in getWalletAnalytics:', error);
            return {
                totalBalance: 0,
                totalWallets: 0,
                activeWallets: 0,
                highestBalance: null,
                balanceByType: {},
                walletDistribution: [],
                recentTransactions: [],
                error: 'Failed to fetch wallet analytics',
            };
        }
    }
    async getActiveWallets() {
        return this.prisma.account.findMany({
            where: {
                isActive: true,
                type: { in: ['Wallet', 'Porter', 'GPay', 'Cash', 'Bank'] },
            },
            select: {
                id: true,
                name: true,
                type: true,
                balance: true,
                accountNumber: true,
            },
            orderBy: { name: 'asc' },
        });
    }
    async transferFunds(transferData) {
        return this.prisma.$transaction(async (tx) => {
            const [fromAccount, toAccount] = await Promise.all([
                tx.account.findUnique({ where: { id: transferData.fromAccountId } }),
                tx.account.findUnique({ where: { id: transferData.toAccountId } }),
            ]);
            if (!fromAccount || !toAccount) {
                throw new common_1.NotFoundException('One or both accounts not found');
            }
            if (!fromAccount.isActive || !toAccount.isActive) {
                throw new common_1.BadRequestException('One or both accounts are inactive');
            }
            if (fromAccount.balance < transferData.amount) {
                throw new common_1.BadRequestException('Insufficient balance in source account');
            }
            const commission = transferData.commission || 0;
            const netAmount = transferData.amount - commission;
            const outgoingTransaction = await tx.transaction.create({
                data: {
                    accountId: transferData.fromAccountId,
                    amount: transferData.amount,
                    direction: 'OUT',
                    type: 'SELF_TRANSFER',
                    subType: 'INTER_ACCOUNT_TRANSFER',
                    description: transferData.description || `Transfer to ${toAccount.name}`,
                    relatedAccountId: transferData.toAccountId,
                    commission: commission,
                    netAmount: netAmount,
                    status: 'COMPLETED',
                },
            });
            const incomingTransaction = await tx.transaction.create({
                data: {
                    accountId: transferData.toAccountId,
                    amount: netAmount,
                    direction: 'IN',
                    type: 'SELF_TRANSFER',
                    subType: 'INTER_ACCOUNT_TRANSFER',
                    description: transferData.description || `Transfer from ${fromAccount.name}`,
                    relatedAccountId: transferData.fromAccountId,
                    commission: 0,
                    netAmount: netAmount,
                    status: 'COMPLETED',
                },
            });
            await tx.account.update({
                where: { id: transferData.fromAccountId },
                data: { balance: { decrement: transferData.amount } },
            });
            await tx.account.update({
                where: { id: transferData.toAccountId },
                data: { balance: { increment: netAmount } },
            });
            return {
                outgoingTransaction,
                incomingTransaction,
                fromAccount: {
                    ...fromAccount,
                    newBalance: fromAccount.balance - transferData.amount,
                },
                toAccount: {
                    ...toAccount,
                    newBalance: toAccount.balance + netAmount,
                },
            };
        });
    }
    async toggleAccountStatus(id) {
        const account = await this.findOne(id);
        return this.prisma.account.update({
            where: { id },
            data: {
                isActive: !account.isActive,
                updatedAt: new Date(),
            },
        });
    }
    async adjustBalance(id, adjustBalanceDto) {
        return this.prisma.$transaction(async (tx) => {
            const account = await tx.account.findUnique({ where: { id } });
            if (!account) {
                throw new common_1.NotFoundException('Account not found');
            }
            if (!account.isActive) {
                throw new common_1.BadRequestException('Account is inactive');
            }
            const { amount, type, description, referenceNumber } = adjustBalanceDto;
            let newBalance;
            let transactionAmount;
            let transactionDirection;
            let transactionType;
            if (type === adjust_balance_dto_1.BalanceAdjustmentType.ADD) {
                newBalance = account.balance + amount;
                transactionAmount = amount;
                transactionDirection = 'IN';
                transactionType = 'BALANCE_ADD';
            }
            else {
                if (account.balance < amount) {
                    throw new common_1.BadRequestException('Insufficient balance');
                }
                newBalance = account.balance - amount;
                transactionAmount = amount;
                transactionDirection = 'OUT';
                transactionType = 'BALANCE_WITHDRAW';
            }
            const updatedAccount = await tx.account.update({
                where: { id },
                data: {
                    balance: newBalance,
                    updatedAt: new Date(),
                },
            });
            const transaction = await tx.transaction.create({
                data: {
                    accountId: id,
                    amount: transactionAmount,
                    direction: transactionDirection,
                    type: transactionType,
                    subType: 'BALANCE_ADJUSTMENT',
                    description: description || `${type} money ${type === 'ADD' ? 'to' : 'from'} wallet`,
                    referenceNumber: referenceNumber,
                    commission: 0,
                    netAmount: transactionAmount,
                    status: 'COMPLETED',
                },
            });
            return {
                account: updatedAccount,
                transaction,
                previousBalance: account.balance,
                newBalance: updatedAccount.balance,
                adjustmentType: type,
                adjustedAmount: amount,
            };
        });
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountService);
//# sourceMappingURL=account.service.js.map