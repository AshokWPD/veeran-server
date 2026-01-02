import { ReportService } from './report.service';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    financialSummary(startDateStr: string, endDateStr: string): Promise<{
        income: number;
        expenses: number;
        profit: number;
    }>;
    topServices(limit?: string): Promise<(import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.BillItemGroupByOutputType, "serviceId"[]> & {
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
