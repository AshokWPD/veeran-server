import express from 'express';
import { TransactionService } from './transaction.service';
import { Transaction } from '@prisma/client';
import { CreateMoneyExchangeDto, TransactionStatus } from './dto/create-transaction.dto';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    findAllWithFilters(page?: string, limit?: string, accountId?: string, type?: string, subType?: string, direction?: string, status?: TransactionStatus, paymentMethod?: string, wallet?: string, startDate?: string, endDate?: string, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAnalytics(startDate?: string, endDate?: string, accountId?: string, type?: string): Promise<{
        totalAmount: number;
        totalCommission: number;
        totalTransactions: number;
        moneyExchangeCount: number;
        serviceCount: number;
        productCount: number;
        netRevenue: number;
    }>;
    getUniqueWallets(): Promise<string[]>;
    getSummaryByType(startDate?: string, endDate?: string): Promise<{
        type: string;
        count: number;
        totalAmount: number;
        totalCommission: number;
    }[]>;
    getTransactionTypes(): Promise<{
        types: string[];
        subTypes: string[];
    }>;
    getTransactionTrends(period?: 'daily' | 'weekly' | 'monthly', startDate?: string, endDate?: string, type?: string): Promise<import("../types/transaction.types").TrendDataPoint[]>;
    getDashboardCards(startDate?: string, endDate?: string): Promise<import("../types/transaction.types").DashboardCard[]>;
    getTransactionDistribution(startDate?: string, endDate?: string, groupBy?: 'type' | 'payment' | 'wallet' | 'status'): Promise<import("../types/transaction.types").DistributionData[]>;
    getTransactionSummary(startDate?: string, endDate?: string): Promise<import("../types/transaction.types").TransactionSummary[]>;
    getTransactionStats(startDate?: string, endDate?: string, groupBy?: 'hour' | 'day' | 'week' | 'month'): Promise<any>;
    getWalletPerformance(startDate?: string, endDate?: string, walletIds?: string | string[]): Promise<import("../types/transaction.types").WalletPerformance[]>;
    getCommissionAnalysis(startDate?: string, endDate?: string, type?: string): Promise<import("../types/transaction.types").CommissionAnalysis>;
    getRecentTransactions(limit?: number): Promise<any[]>;
    getTransactionComparison(period1Start: string, period1End: string, period2Start: string, period2End: string, type?: string): Promise<any>;
    getTopPerformers(startDate?: string, endDate?: string, limit?: string, type?: 'service' | 'product' | 'all'): Promise<any[]>;
    createMoneyExchange(createMoneyExchangeDto: CreateMoneyExchangeDto): Promise<{
        cashTransaction: Transaction;
        digitalTransaction: Transaction;
    }>;
    downloadReceipt(id: string, res: express.Response): Promise<express.Response<any, Record<string, any>>>;
    findOne(id: string): Promise<Transaction>;
}
