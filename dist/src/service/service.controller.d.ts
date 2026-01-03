import express from 'express';
import { ServiceService } from './service.service';
import { Service } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ExportServicesQueryDto } from './dto/service-analytics.dto';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    findAll(page?: string, limit?: string, category?: string, serviceType?: string, search?: string, isActive?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: Service[];
        total: number;
        page: number;
        limit: number;
    }>;
    getQuickStats(): Promise<{
        totalServices: number;
        activeServices: number;
        totalRevenuePotential: number;
        popularService: string;
    }>;
    findOne(id: string): Promise<Service>;
    create(createServiceDto: CreateServiceDto): Promise<Service>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<Service>;
    exportServices(query: ExportServicesQueryDto, res: express.Response): Promise<void>;
    toggleServiceStatus(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string;
        serviceType: string;
        defaultPrice: number;
        commissionRate: number | null;
        minAmount: number | null;
        maxAmount: number | null;
        hasOnlineCharge: boolean;
        onlineCharge: number | null;
        instructions: string | null;
    }>;
}
