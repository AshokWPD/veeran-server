export declare class ServiceAnalyticsQueryDto {
    startDate?: string;
    endDate?: string;
}
export declare class ServiceAnalyticsResponseDto {
    totalServices: number;
    activeServices: number;
    totalRevenuePotential: number;
    popularService: string;
    usageByCategory: Record<string, number>;
    revenueByCategory: Record<string, number>;
    topServices: Array<{
        id: string;
        name: string;
        usageCount: number;
        totalRevenue: number;
    }>;
}
export declare class ServiceUsageStatsDto {
    serviceId: string;
    serviceName: string;
    usageCount: number;
    totalRevenue: number;
    lastUsed: Date;
}
export declare class ExportServicesQueryDto {
    format?: 'csv' | 'excel' | 'json';
    category?: string;
    status?: string;
}
