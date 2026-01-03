export declare class DashboardQueryDto {
    startDate?: string;
    endDate?: string;
    accountId?: string;
}
export declare class QuickStatsDto {
    label: string;
    value: string;
    percent: number;
    color: string;
    chart: number[];
}
export declare class ServiceStatsDto {
    label: string;
    color: string;
    count: number;
}
export declare class WalletBalanceDto {
    name: string;
    balance: number;
}
export declare class RecentTransactionDto {
    icon: string;
    name: string;
    id: string;
    amount: number;
    time: string;
    status: string;
    commission: number;
}
export declare class IncomeBreakdownDto {
    series: number[];
    labels: string[];
    details: Array<{
        label: string;
        value: number;
    }>;
}
export declare class DashboardResponseDto {
    quickStats: QuickStatsDto[];
    monthlyRevenue: {
        series: Array<{
            name: string;
            data: number[];
        }>;
        categories: string[];
        percent: number;
    };
    serviceStats: ServiceStatsDto[];
    walletBalances: WalletBalanceDto[];
    recentTransactions: RecentTransactionDto[];
    serviceIncome: IncomeBreakdownDto;
}
