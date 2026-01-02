import { PrismaService } from '../core/services/prisma.service';
import { DashboardQueryDto, DashboardResponseDto } from './dto/dashboard.dto';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardData(query: DashboardQueryDto): Promise<DashboardResponseDto>;
    getQuickStats(query: DashboardQueryDto): Promise<{
        icon: string;
        label: string;
        value: string;
        percent: number;
        color: string;
        chart: number[];
    }[]>;
    getMonthlyRevenue(query: DashboardQueryDto): Promise<{
        series: {
            name: string;
            data: number[];
        }[];
        categories: string[];
        percent: number;
    }>;
    getServiceStats(query: DashboardQueryDto): Promise<{
        label: string;
        color: string;
        count: number;
    }[]>;
    getWalletBalances(): Promise<{
        name: string;
        balance: number;
        type: string;
    }[]>;
    getRecentTransactions(query: DashboardQueryDto): Promise<{
        icon: string;
        name: string;
        id: string;
        amount: number;
        time: string;
        status: string;
        commission: number;
    }[]>;
    getIncomeBreakdown(query: DashboardQueryDto): Promise<{
        series: number[];
        labels: string[];
        details: {
            label: string;
            value: number;
        }[];
    }>;
    private getTransactionDisplayName;
}
