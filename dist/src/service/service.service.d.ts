import { PrismaService } from '../core/services/prisma.service';
import { Service } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ExportServicesQueryDto } from './dto/service-analytics.dto';
export declare class ServiceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        page?: number;
        limit?: number;
        category?: string;
        serviceType?: string;
        search?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: Service[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Service>;
    private validateServiceData;
    create(data: CreateServiceDto): Promise<Service>;
    update(id: string, data: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<Service>;
    exportServices(query: ExportServicesQueryDto): Promise<{
        data: string;
        filename: string;
        contentType: string;
    }>;
    getQuickStats(): Promise<{
        totalServices: number;
        activeServices: number;
        totalRevenuePotential: number;
        popularService: string;
    }>;
    toggleServiceStatus(id: string): Promise<Service>;
}
