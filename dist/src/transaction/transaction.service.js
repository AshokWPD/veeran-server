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
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
const client_1 = require("@prisma/client");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
let TransactionService = class TransactionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllWithFilters(filters) {
        const { page = 1, limit = 10, accountId, type, subType, direction, status, paymentMethod, wallet, startDate, endDate, search, sortBy = 'createdAt', sortOrder = 'desc', } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (accountId) {
            where.OR = [{ accountId }, { relatedAccountId: accountId }];
        }
        if (type) {
            where.type = type;
        }
        if (subType) {
            where.subType = subType;
        }
        if (direction) {
            where.direction = direction;
        }
        if (status) {
            where.status = status;
        }
        if (paymentMethod) {
            where.metadata = {
                equals: JSON.stringify({ paymentMethod }),
            };
        }
        if (wallet) {
            where.metadata = {
                equals: JSON.stringify({ wallet }),
            };
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
                { description: { contains: search } },
                { referenceNumber: { contains: search } },
                {
                    bill: {
                        OR: [
                            { billNumber: { contains: search } },
                            { customerPhone: { contains: search } },
                            { customerName: { contains: search } },
                        ],
                    },
                },
            ];
        }
        const orderBy = {};
        if (sortBy === 'amount') {
            orderBy.amount = sortOrder;
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
            this.prisma.transaction.findMany({
                where,
                include: {
                    account: true,
                    relatedAccount: true,
                    bill: {
                        include: {
                            customer: true,
                            items: {
                                include: {
                                    service: true,
                                },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        const transformedData = data.map((transaction) => {
            const metadata = transaction.metadata;
            return {
                id: transaction.id,
                type: transaction.type,
                subType: transaction.subType,
                amount: transaction.amount,
                commission: transaction.commission,
                netAmount: transaction.netAmount,
                wallet: metadata?.wallet || transaction.account.name,
                customerPhone: transaction.bill?.customerPhone || transaction.bill?.customer?.phone,
                paymentMethod: metadata?.paymentMethod || 'CASH',
                status: transaction.status === 'COMPLETED' ? 'ENABLE' : 'DISABLE',
                timestamp: transaction.createdAt.toISOString(),
                billNumber: transaction.bill?.billNumber,
                description: transaction.description,
                direction: transaction.direction,
                account: transaction.account,
                relatedAccount: transaction.relatedAccount,
            };
        });
        return {
            data: transformedData,
            total,
            page: Number(page),
            limit: Number(limit),
        };
    }
    async getTransactionAnalytics(params) {
        const where = {
            status: 'COMPLETED',
        };
        if (params.accountId) {
            where.OR = [
                { accountId: params.accountId },
                { relatedAccountId: params.accountId },
            ];
        }
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = params.startDate;
            if (params.endDate)
                where.createdAt.lte = params.endDate;
        }
        if (params.type) {
            where.type = params.type;
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                bill: true,
            },
        });
        const totalAmount = transactions
            .filter((t) => t.direction === 'IN')
            .reduce((sum, t) => sum + t.netAmount, 0);
        const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);
        const totalTransactions = transactions.length;
        const moneyExchangeCount = transactions.filter((t) => t.type === 'MONEY_EXCHANGE').length;
        const serviceCount = transactions.filter((t) => t.type === 'SERVICE').length;
        const productCount = transactions.filter((t) => t.type === 'PRODUCT').length;
        const netRevenue = totalAmount + totalCommission;
        return {
            totalAmount,
            totalCommission,
            totalTransactions,
            moneyExchangeCount,
            serviceCount,
            productCount,
            netRevenue,
        };
    }
    async getUniqueWallets() {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                metadata: {
                    not: client_1.Prisma.DbNull,
                },
            },
            select: {
                metadata: true,
            },
        });
        const wallets = transactions
            .map((t) => {
            const metadata = t.metadata;
            return metadata?.wallet;
        })
            .filter((wallet) => !!wallet && typeof wallet === 'string');
        return Array.from(new Set(wallets));
    }
    async getTransactionSummaryByType(params) {
        const where = {
            status: 'COMPLETED',
        };
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = params.startDate;
            if (params.endDate)
                where.createdAt.lte = params.endDate;
        }
        const transactions = await this.prisma.transaction.groupBy({
            by: ['type'],
            where,
            _count: {
                id: true,
            },
            _sum: {
                amount: true,
                commission: true,
                netAmount: true,
            },
        });
        return transactions.map((group) => ({
            type: group.type,
            count: group._count.id,
            totalAmount: group._sum.netAmount || 0,
            totalCommission: group._sum.commission || 0,
        }));
    }
    async findOne(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                account: true,
                relatedAccount: true,
                bill: true,
            },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        return transaction;
    }
    async createMoneyExchange(exchangeData) {
        return this.prisma.$transaction(async (tx) => {
            const customerReceives = exchangeData.amount - exchangeData.commission;
            const cashTransaction = await tx.transaction.create({
                data: {
                    accountId: exchangeData.cashAccountId,
                    amount: exchangeData.amount,
                    direction: create_transaction_dto_1.TransactionDirection.IN,
                    type: 'MONEY_EXCHANGE',
                    subType: 'CASH_TO_GPAY',
                    description: exchangeData.description ||
                        'Customer gave cash for digital transfer',
                    relatedAccountId: exchangeData.digitalAccountId,
                    commission: 0,
                    netAmount: exchangeData.amount,
                    profit: exchangeData.commission,
                    status: create_transaction_dto_1.TransactionStatus.COMPLETED,
                    metadata: exchangeData.metadata,
                },
            });
            const digitalTransaction = await tx.transaction.create({
                data: {
                    accountId: exchangeData.digitalAccountId,
                    amount: customerReceives,
                    direction: create_transaction_dto_1.TransactionDirection.OUT,
                    type: 'MONEY_EXCHANGE',
                    subType: 'CASH_TO_GPAY',
                    description: exchangeData.description || 'Transferred to customer digitally',
                    relatedAccountId: exchangeData.cashAccountId,
                    commission: 0,
                    netAmount: customerReceives,
                    profit: 0,
                    status: create_transaction_dto_1.TransactionStatus.COMPLETED,
                    metadata: exchangeData.metadata,
                },
            });
            await this.updateAccountBalance(exchangeData.cashAccountId, exchangeData.amount, create_transaction_dto_1.TransactionDirection.IN);
            await this.updateAccountBalance(exchangeData.digitalAccountId, customerReceives, create_transaction_dto_1.TransactionDirection.OUT);
            return { cashTransaction, digitalTransaction };
        });
    }
    async updateAccountBalance(accountId, amount, direction) {
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const balanceChange = direction === 'IN' ? amount : -amount;
        const newBalance = account.balance + balanceChange;
        await this.prisma.account.update({
            where: { id: accountId },
            data: { balance: newBalance },
        });
    }
    async getTransactionTypes() {
        const types = await this.prisma.transaction.findMany({
            select: { type: true },
            distinct: ['type'],
        });
        const subTypes = await this.prisma.transaction.findMany({
            select: { subType: true },
            distinct: ['subType'],
        });
        return {
            types: types.map((t) => t.type).filter(Boolean),
            subTypes: subTypes
                .map((t) => t.subType)
                .filter((subType) => subType !== null),
        };
    }
    async getTransactionTrends(params) {
        const { period = 'daily', startDate, endDate, type } = params;
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        if (type) {
            where.type = type;
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });
        const grouped = transactions.reduce((acc, tx) => {
            const date = new Date(tx.createdAt);
            let key;
            switch (period) {
                case 'daily':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'weekly':
                    const week = this.getWeekNumber(date);
                    key = `${date.getFullYear()}-W${week}`;
                    break;
                case 'monthly':
                    key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
            }
            if (!acc[key]) {
                acc[key] = { date: key, amount: 0, count: 0, commission: 0, profit: 0 };
            }
            acc[key].amount += tx.netAmount || tx.amount;
            acc[key].count += 1;
            acc[key].commission += tx.commission || 0;
            acc[key].profit += tx.profit || 0;
            return acc;
        }, {});
        return Object.values(grouped);
    }
    async getDashboardCards(startDate, endDate) {
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [totalAmount, totalTransactions, totalCommission, avgTransaction, previousPeriodData,] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { ...where, direction: 'IN' },
                _sum: { netAmount: true },
            }),
            this.prisma.transaction.count({ where }),
            this.prisma.transaction.aggregate({
                where,
                _sum: { commission: true },
            }),
            this.prisma.transaction.aggregate({
                where: { ...where, direction: 'IN' },
                _avg: { netAmount: true },
            }),
            this.getPreviousPeriodData(startDate, endDate),
        ]);
        const calculateChange = (current, previous) => {
            if (previous === 0)
                return 100;
            return ((current - previous) / previous) * 100;
        };
        return [
            {
                title: 'Total Revenue',
                value: totalAmount._sum.netAmount || 0,
                change: calculateChange(totalAmount._sum.netAmount || 0, previousPeriodData.totalAmount || 0),
                icon: 'wallet',
                color: 'green',
                format: 'currency',
            },
            {
                title: 'Total Transactions',
                value: totalTransactions,
                change: calculateChange(totalTransactions, previousPeriodData.totalTransactions || 0),
                icon: 'receipt',
                color: 'blue',
                format: 'number',
            },
            {
                title: 'Total Commission',
                value: totalCommission._sum.commission || 0,
                change: calculateChange(totalCommission._sum.commission || 0, previousPeriodData.totalCommission || 0),
                icon: 'card-transfer',
                color: 'orange',
                format: 'currency',
            },
            {
                title: 'Avg Transaction',
                value: avgTransaction._avg.netAmount || 0,
                change: calculateChange(avgTransaction._avg.netAmount || 0, previousPeriodData.avgTransaction || 0),
                icon: 'graph-up',
                color: 'purple',
                format: 'currency',
            },
        ];
    }
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    async getPreviousPeriodData(startDate, endDate) {
        if (!startDate || !endDate)
            return {};
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        const previousEndDate = new Date(endDate.getTime() - periodLength);
        const where = {
            status: 'COMPLETED',
            createdAt: {
                gte: previousStartDate,
                lte: previousEndDate,
            },
        };
        const [totalAmount, totalTransactions, totalCommission, avgTransaction,] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: { ...where, direction: 'IN' },
                _sum: { netAmount: true },
            }),
            this.prisma.transaction.count({ where }),
            this.prisma.transaction.aggregate({
                where,
                _sum: { commission: true },
            }),
            this.prisma.transaction.aggregate({
                where: { ...where, direction: 'IN' },
                _avg: { netAmount: true },
            }),
        ]);
        return {
            totalAmount: totalAmount._sum.netAmount || 0,
            totalTransactions,
            totalCommission: totalCommission._sum.commission || 0,
            avgTransaction: avgTransaction._avg.netAmount || 0,
        };
    }
    async getTransactionDistribution(startDate, endDate, groupBy) {
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                account: true,
                bill: true,
            },
        });
        const grouped = transactions.reduce((acc, tx) => {
            let key;
            switch (groupBy) {
                case 'type':
                    key = tx.type || 'Unknown';
                    break;
                case 'payment':
                    const bill = tx.bill;
                    key = bill?.paymentMode || 'CASH';
                    break;
                case 'wallet':
                    key = tx.account?.name || 'Unknown';
                    break;
                case 'status':
                    key = tx.status;
                    break;
                default:
                    key = tx.type || 'Unknown';
            }
            if (!acc[key]) {
                acc[key] = { name: key, value: 0, amount: 0 };
            }
            acc[key].value += 1;
            acc[key].amount += tx.netAmount || tx.amount;
            return acc;
        }, {});
        const totalTransactions = transactions.length;
        const totalAmount = transactions.reduce((sum, tx) => sum + (tx.netAmount || tx.amount), 0);
        return Object.values(grouped).map((item) => ({
            ...item,
            percentage: totalTransactions > 0 ? (item.value / totalTransactions) * 100 : 0,
        }));
    }
    async getWalletPerformance(startDate, endDate, walletIds) {
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        if (walletIds && walletIds.length > 0) {
            where.OR = [
                { accountId: { in: walletIds } },
                { relatedAccountId: { in: walletIds } },
            ];
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            include: {
                account: true,
            },
        });
        const walletMap = new Map();
        transactions.forEach(tx => {
            const walletId = tx.accountId;
            const walletName = tx.account?.name || 'Unknown';
            if (!walletMap.has(walletId)) {
                walletMap.set(walletId, {
                    walletId,
                    walletName,
                    incoming: 0,
                    outgoing: 0,
                    net: 0,
                    transactionCount: 0,
                    averageTransaction: 0,
                });
            }
            const wallet = walletMap.get(walletId);
            if (tx.direction === 'IN') {
                wallet.incoming += tx.netAmount || tx.amount;
            }
            else {
                wallet.outgoing += tx.netAmount || tx.amount;
            }
            wallet.transactionCount += 1;
            wallet.net = wallet.incoming - wallet.outgoing;
        });
        const results = Array.from(walletMap.values());
        results.forEach(wallet => {
            wallet.averageTransaction = wallet.transactionCount > 0
                ? (wallet.incoming + wallet.outgoing) / wallet.transactionCount
                : 0;
        });
        return results.sort((a, b) => b.net - a.net);
    }
    async getRecentTransactions(limit = 10) {
        const transactions = await this.prisma.transaction.findMany({
            where: { status: 'COMPLETED' },
            include: {
                account: true,
                relatedAccount: true,
                bill: {
                    include: {
                        customer: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return transactions.map(tx => this.formatTransaction(tx));
    }
    formatTransaction(tx) {
        return {
            id: tx.id,
            type: tx.type,
            subType: tx.subType,
            amount: tx.amount,
            commission: tx.commission,
            netAmount: tx.netAmount,
            wallet: tx.account?.name || 'Unknown',
            customerPhone: tx.bill?.customerPhone || tx.bill?.customer?.phone,
            paymentMethod: tx.bill?.paymentMode || 'CASH',
            status: tx.status,
            timestamp: tx.createdAt.toISOString(),
            billNumber: tx.bill?.billNumber,
            description: tx.description,
            account: tx.account,
            relatedAccount: tx.relatedAccount,
            direction: tx.direction,
            profit: tx.profit,
            createdAt: tx.createdAt.toISOString(),
        };
    }
    async getTransactionSummary(startDate, endDate) {
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const transactions = await this.prisma.transaction.groupBy({
            by: ['type'],
            where,
            _count: {
                id: true,
            },
            _sum: {
                amount: true,
                commission: true,
                netAmount: true,
            },
        });
        const totalTransactions = transactions.reduce((sum, group) => sum + group._count.id, 0);
        const totalAmount = transactions.reduce((sum, group) => sum + (group._sum.netAmount || 0), 0);
        return transactions.map((group) => ({
            type: group.type,
            count: group._count.id,
            totalAmount: group._sum.netAmount || 0,
            totalCommission: group._sum.commission || 0,
            averageAmount: group._count.id > 0 ? (group._sum.netAmount || 0) / group._count.id : 0,
            percentage: totalTransactions > 0 ? (group._count.id / totalTransactions) * 100 : 0,
        }));
    }
    async getTransactionStats(params) {
        const { startDate, endDate, groupBy = 'day' } = params;
        const where = {
            status: 'COMPLETED',
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });
        const grouped = transactions.reduce((acc, tx) => {
            const date = new Date(tx.createdAt);
            let key;
            switch (groupBy) {
                case 'hour':
                    key = `${date.toISOString().split('T')[0]} ${date.getHours()}:00`;
                    break;
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const week = this.getWeekNumber(date);
                    key = `${date.getFullYear()}-W${week}`;
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
            }
            if (!acc[key]) {
                acc[key] = {
                    period: key,
                    count: 0,
                    amount: 0,
                    commission: 0,
                    profit: 0,
                };
            }
            acc[key].count += 1;
            acc[key].amount += tx.netAmount || tx.amount;
            acc[key].commission += tx.commission || 0;
            acc[key].profit += tx.profit || 0;
            return acc;
        }, {});
        return Object.values(grouped);
    }
    async getCommissionAnalysis(startDate, endDate, type) {
        const where = {
            status: 'COMPLETED',
            commission: { gt: 0 },
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        if (type) {
            where.type = type;
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });
        const commissionByType = transactions.reduce((acc, tx) => {
            const type = tx.type || 'Unknown';
            if (!acc[type]) {
                acc[type] = { type, commission: 0, count: 0 };
            }
            acc[type].commission += tx.commission || 0;
            acc[type].count += 1;
            return acc;
        }, {});
        const totalCommission = transactions.reduce((sum, tx) => sum + (tx.commission || 0), 0);
        const commissionByTypeArray = Object.values(commissionByType).map((item) => ({
            ...item,
            percentage: totalCommission > 0 ? (item.commission / totalCommission) * 100 : 0,
        }));
        const dailyTrend = this.getDailyTrend(transactions, 'commission');
        const topCommissionServices = await this.getTopCommissionServices(startDate, endDate);
        return {
            totalCommission,
            commissionByType: commissionByTypeArray,
            commissionTrend: dailyTrend,
            topCommissionServices,
        };
    }
    getDailyTrend(transactions, field) {
        const daily = transactions.reduce((acc, tx) => {
            const date = new Date(tx.createdAt).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, amount: 0, count: 0, commission: 0, profit: 0 };
            }
            acc[date].amount += tx.netAmount || tx.amount;
            acc[date].count += 1;
            acc[date].commission += tx.commission || 0;
            acc[date].profit += tx.profit || 0;
            return acc;
        }, {});
        return Object.values(daily);
    }
    async getTransactionComparison(params) {
        const { period1Start, period1End, period2Start, period2End, type } = params;
        const where1 = {
            status: 'COMPLETED',
            createdAt: {
                gte: period1Start,
                lte: period1End,
            }
        };
        const where2 = {
            status: 'COMPLETED',
            createdAt: {
                gte: period2Start,
                lte: period2End,
            }
        };
        if (type) {
            where1.type = type;
            where2.type = type;
        }
        const [period1Data, period2Data] = await Promise.all([
            this.getPeriodSummary(where1),
            this.getPeriodSummary(where2),
        ]);
        return {
            period1: {
                ...period1Data,
                dateRange: `${period1Start.toISOString().split('T')[0]} to ${period1End.toISOString().split('T')[0]}`
            },
            period2: {
                ...period2Data,
                dateRange: `${period2Start.toISOString().split('T')[0]} to ${period2End.toISOString().split('T')[0]}`
            },
            comparison: this.comparePeriods(period1Data, period2Data),
        };
    }
    async getPeriodSummary(where) {
        const [transactions, totalAmount, totalCommission, avgTransaction] = await Promise.all([
            this.prisma.transaction.findMany({ where }),
            this.prisma.transaction.aggregate({
                where: { ...where, direction: 'IN' },
                _sum: { netAmount: true },
            }),
            this.prisma.transaction.aggregate({
                where,
                _sum: { commission: true },
            }),
            this.prisma.transaction.aggregate({
                where: { ...where, direction: 'IN' },
                _avg: { netAmount: true },
            }),
        ]);
        return {
            totalTransactions: transactions.length,
            totalAmount: totalAmount._sum.netAmount || 0,
            totalCommission: totalCommission._sum.commission || 0,
            averageTransaction: avgTransaction._avg.netAmount || 0,
            transactionTypes: this.getTransactionTypeDistribution(transactions),
        };
    }
    getTransactionTypeDistribution(transactions) {
        const grouped = transactions.reduce((acc, tx) => {
            const type = tx.type || 'Unknown';
            if (!acc[type]) {
                acc[type] = { type, count: 0, amount: 0 };
            }
            acc[type].count += 1;
            acc[type].amount += tx.netAmount || tx.amount;
            return acc;
        }, {});
        return Object.values(grouped);
    }
    comparePeriods(period1, period2) {
        const calculateChange = (current, previous) => {
            if (previous === 0)
                return 100;
            return ((current - previous) / previous) * 100;
        };
        return {
            totalTransactions: {
                change: calculateChange(period2.totalTransactions, period1.totalTransactions),
                difference: period2.totalTransactions - period1.totalTransactions,
            },
            totalAmount: {
                change: calculateChange(period2.totalAmount, period1.totalAmount),
                difference: period2.totalAmount - period1.totalAmount,
            },
            totalCommission: {
                change: calculateChange(period2.totalCommission, period1.totalCommission),
                difference: period2.totalCommission - period1.totalCommission,
            },
            averageTransaction: {
                change: calculateChange(period2.averageTransaction, period1.averageTransaction),
                difference: period2.averageTransaction - period1.averageTransaction,
            },
        };
    }
    async getTopPerformers(startDate, endDate, limit = 10, type = 'all') {
        try {
            const where = {
                bill: {}
            };
            if (startDate || endDate) {
                where.bill.createdAt = {};
                if (startDate)
                    where.bill.createdAt.gte = startDate;
                if (endDate)
                    where.bill.createdAt.lte = endDate;
            }
            where.bill.paymentStatus = 'PAID';
            if (type !== 'all') {
                if (type === 'service') {
                    where.itemType = 'SERVICE';
                }
                else if (type === 'product') {
                    where.itemType = 'PRODUCT';
                }
            }
            const billItems = await this.prisma.billItem.groupBy({
                by: ['itemName'],
                where: where,
                _sum: {
                    quantity: true,
                    totalAmount: true,
                    profit: true,
                },
                _count: {
                    id: true,
                },
                orderBy: {
                    _sum: {
                        totalAmount: 'desc',
                    },
                },
                take: limit ? Number(limit) : 10,
            });
            return billItems.map(item => ({
                name: item.itemName,
                count: item._count.id,
                quantity: item._sum.quantity || 0,
                totalAmount: item._sum.totalAmount || 0,
                totalProfit: item._sum.profit || 0,
                averageProfit: item._count.id > 0 ? (item._sum.profit || 0) / item._count.id : 0,
            }));
        }
        catch (error) {
            console.error('Error in getTopPerformers:', error);
            throw error;
        }
    }
    async downloadReceipt(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                account: true,
                bill: {
                    include: {
                        customer: true,
                        items: true,
                    },
                },
            },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        const receiptContent = `
      Transaction Receipt
      ===================
      Receipt ID: ${transaction.id}
      Date: ${transaction.createdAt.toLocaleString()}
      Type: ${transaction.type}
      Amount: ₹${transaction.amount}
      Commission: ₹${transaction.commission}
      Net Amount: ₹${transaction.netAmount}
      Wallet: ${transaction.account?.name || 'N/A'}
      Description: ${transaction.description || 'N/A'}
      Bill Number: ${transaction.bill?.billNumber || 'N/A'}
      Status: ${transaction.status}
    `;
        return Buffer.from(receiptContent, 'utf-8');
    }
    async getTopCommissionServices(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const billItems = await this.prisma.billItem.groupBy({
            by: ['itemName'],
            where: {
                bill: {
                    ...where,
                    paymentStatus: 'PAID',
                },
                commission: { gt: 0 },
            },
            _sum: {
                commission: true,
                totalAmount: true,
            },
            _count: {
                id: true,
            },
            orderBy: {
                _sum: {
                    commission: 'desc',
                },
            },
            take: 10,
        });
        return billItems.map(item => ({
            service: item.itemName,
            commission: item._sum.commission || 0,
            count: item._count.id,
            totalAmount: item._sum.totalAmount || 0,
        }));
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map