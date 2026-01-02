export interface TrendDataPoint {
    date: string;
    amount: number;
    count: number;
    commission: number;
    profit: number;
}
export interface DashboardCard {
    title: string;
    value: number;
    change: number;
    icon: string;
    color: string;
    format: 'currency' | 'number' | 'percentage';
}
export interface DistributionData {
    name: string;
    value: number;
    amount: number;
    percentage: number;
}
export interface WalletPerformance {
    walletId: string;
    walletName: string;
    incoming: number;
    outgoing: number;
    net: number;
    transactionCount: number;
    averageTransaction: number;
}
export interface CommissionAnalysis {
    totalCommission: number;
    commissionByType: Array<{
        type: string;
        commission: number;
        count: number;
        percentage: number;
    }>;
    commissionTrend: TrendDataPoint[];
    topCommissionServices: Array<{
        service: string;
        commission: number;
        count: number;
    }>;
}
export interface TransactionSummary {
    type: string;
    count: number;
    totalAmount: number;
    totalCommission: number;
    averageAmount: number;
    percentage: number;
}
