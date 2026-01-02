import { PrismaService } from '../core/services/prisma.service';
import { Transaction } from '@prisma/client';
import { CreateMoneyExchangeDto, TransactionFilterDto } from './dto/create-transaction.dto';
import { TrendDataPoint, DashboardCard, DistributionData, WalletPerformance, CommissionAnalysis, TransactionSummary } from '../types/transaction.types';
export declare class TransactionService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllWithFilters(filters: TransactionFilterDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTransactionAnalytics(params: {
        startDate?: Date;
        endDate?: Date;
        accountId?: string;
        type?: string;
    }): Promise<{
        totalAmount: number;
        totalCommission: number;
        totalTransactions: number;
        moneyExchangeCount: number;
        serviceCount: number;
        productCount: number;
        netRevenue: number;
    }>;
    getUniqueWallets(): Promise<string[]>;
    getTransactionSummaryByType(params: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<Array<{
        type: string;
        count: number;
        totalAmount: number;
        totalCommission: number;
    }>>;
    findOne(id: string): Promise<Transaction>;
    createMoneyExchange(exchangeData: CreateMoneyExchangeDto): Promise<{
        cashTransaction: Transaction;
        digitalTransaction: Transaction;
    }>;
    private updateAccountBalance;
    getTransactionTypes(): Promise<{
        types: string[];
        subTypes: string[];
    }>;
    getTransactionTrends(params: {
        period?: 'daily' | 'weekly' | 'monthly';
        startDate?: Date;
        endDate?: Date;
        type?: string;
    }): Promise<TrendDataPoint[]>;
    getDashboardCards(startDate?: Date, endDate?: Date): Promise<DashboardCard[]>;
    private getWeekNumber;
    private getPreviousPeriodData;
    getTransactionDistribution(startDate?: Date, endDate?: Date, groupBy?: 'type' | 'payment' | 'wallet' | 'status'): Promise<DistributionData[]>;
    getWalletPerformance(startDate?: Date, endDate?: Date, walletIds?: string[]): Promise<WalletPerformance[]>;
    getRecentTransactions(limit?: number): Promise<any[]>;
    private formatTransaction;
    getTransactionSummary(startDate?: Date, endDate?: Date): Promise<TransactionSummary[]>;
    getTransactionStats(params: {
        startDate?: Date;
        endDate?: Date;
        groupBy?: 'hour' | 'day' | 'week' | 'month';
    }): Promise<any>;
    getCommissionAnalysis(startDate?: Date, endDate?: Date, type?: string): Promise<CommissionAnalysis>;
    private getDailyTrend;
    getTransactionComparison(params: {
        period1Start: Date;
        period1End: Date;
        period2Start: Date;
        period2End: Date;
        type?: string;
    }): Promise<any>;
    private getPeriodSummary;
    private getTransactionTypeDistribution;
    private comparePeriods;
    getTopPerformers(startDate?: Date, endDate?: Date, limit?: number, type?: 'service' | 'product' | 'all'): Promise<any[]>;
    downloadReceipt(id: string): Promise<Buffer>;
    private getTopCommissionServices;
}
