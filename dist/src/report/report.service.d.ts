import { PrismaService } from '../core/services/prisma.service';
export declare class ReportService {
    private prisma;
    constructor(prisma: PrismaService);
    financialSummary(startDate: Date, endDate: Date): Promise<{
        income: number;
        expenses: number;
        profit: number;
    }>;
    topServices(limit?: number): Promise<(import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.BillItemGroupByOutputType, "serviceId"[]> & {
        _count: {
            serviceId: number;
        };
    })[]>;
    accountBalances(): Promise<{
        name: string;
        id: string;
        type: string;
        balance: number;
    }[]>;
}
