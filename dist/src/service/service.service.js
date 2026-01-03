"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../core/services/prisma.service");
const create_service_dto_1 = require("./dto/create-service.dto");
let ServiceService = class ServiceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { page = 1, limit = 10, category, serviceType, search, isActive, sortBy = 'name', sortOrder = 'asc', } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (category) {
            where.category = category;
        }
        if (serviceType) {
            where.serviceType = serviceType;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
            ];
        }
        const orderBy = {};
        if (sortBy === 'price') {
            orderBy.defaultPrice = sortOrder;
        }
        else if (sortBy === 'category') {
            orderBy.category = sortOrder;
        }
        else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        }
        else {
            orderBy.name = sortOrder;
        }
        const [data, total] = await Promise.all([
            this.prisma.service.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
            this.prisma.service.count({ where }),
        ]);
        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit),
        };
    }
    async findOne(id) {
        const service = await this.prisma.service.findUnique({ where: { id } });
        if (!service)
            throw new common_1.NotFoundException('Service not found');
        return service;
    }
    validateServiceData(data) {
        if (data.serviceType === create_service_dto_1.ServiceType.PERCENTAGE_COMMISSION) {
            if (!data.commissionRate) {
                throw new common_1.BadRequestException('Commission rate is required for percentage commission services');
            }
            if (data.commissionRate < 0 || data.commissionRate > 100) {
                throw new common_1.BadRequestException('Commission rate must be between 0 and 100');
            }
        }
        if (data.serviceType === create_service_dto_1.ServiceType.VARIABLE_PRICE) {
            if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
                throw new common_1.BadRequestException('Minimum amount cannot be greater than maximum amount');
            }
        }
    }
    async create(data) {
        this.validateServiceData(data);
        const preparedData = {
            ...data,
            isActive: data.isActive ?? true,
            commissionRate: data.commissionRate || null,
            minAmount: data.minAmount || null,
            maxAmount: data.maxAmount || null,
            onlineCharge: null,
        };
        return this.prisma.service.create({ data: preparedData });
    }
    async update(id, data) {
        await this.findOne(id);
        if (data.serviceType ||
            data.commissionRate ||
            data.minAmount ||
            data.maxAmount) {
            const existingService = await this.findOne(id);
            const mergedData = { ...existingService, ...data };
            this.validateServiceData(mergedData);
        }
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        if (data.hasOnlineCharge === true) {
            updateData.onlineCharge = null;
        }
        return this.prisma.service.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const billItemsCount = await this.prisma.billItem.count({
            where: { serviceId: id },
        });
        if (billItemsCount > 0) {
            throw new common_1.BadRequestException('Cannot delete service that is used in bills. Deactivate it instead.');
        }
        return this.prisma.service.delete({ where: { id } });
    }
    async exportServices(query) {
        const { format = 'csv', category, status } = query;
        const where = {};
        if (category) {
            where.category = category;
        }
        if (status) {
            where.isActive = status === 'active';
        }
        const services = await this.prisma.service.findMany({
            where,
            include: {
                billItems: {
                    select: {
                        quantity: true,
                        totalAmount: true,
                    },
                },
            },
        });
        const servicesWithStats = services.map((service) => {
            const usageCount = service.billItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalRevenue = service.billItems.reduce((sum, item) => sum + item.totalAmount, 0);
            return {
                name: service.name,
                code: service.name,
                type: service.category,
                price: service.defaultPrice,
                commissionRate: service.commissionRate,
                status: service.isActive ? 'Active' : 'Disabled',
                usageCount,
                totalRevenue,
                description: service.description,
                createdAt: service.createdAt,
            };
        });
        if (format === 'json') {
            return {
                data: JSON.stringify(servicesWithStats, null, 2),
                filename: `services-export-${new Date().toISOString().split('T')[0]}.json`,
                contentType: 'application/json',
            };
        }
        else {
            const headers = [
                'Name',
                'Code',
                'Type',
                'Price',
                'Commission',
                'Status',
                'Usage Count',
                'Total Revenue',
                'Description',
            ];
            const csvData = servicesWithStats.map((service) => [
                service.name,
                service.code,
                service.type,
                service.price?.toString() || '0',
                service.commissionRate?.toString() || '',
                service.status,
                service.usageCount.toString(),
                service.totalRevenue.toString(),
                service.description || '',
            ]);
            const csvContent = [headers, ...csvData]
                .map((row) => row.map((field) => `"${field}"`).join(','))
                .join('\n');
            return {
                data: csvContent,
                filename: `services-export-${new Date().toISOString().split('T')[0]}.csv`,
                contentType: 'text/csv',
            };
        }
    }
    async getQuickStats() {
        const totalServices = await this.prisma.service.count();
        const activeServices = await this.prisma.service.count({
            where: { isActive: true },
        });
        const totalRevenue = await this.prisma.billItem.aggregate({
            _sum: { totalAmount: true },
        });
        const popularService = await this.prisma.service.findFirst({
            include: {
                billItems: {
                    select: { quantity: true },
                },
            },
            orderBy: {
                billItems: {
                    _count: 'desc',
                },
            },
        });
        return {
            totalServices,
            activeServices,
            totalRevenuePotential: totalRevenue._sum.totalAmount || 0,
            popularService: popularService?.name || 'No services',
        };
    }
    async toggleServiceStatus(id) {
        const service = await this.findOne(id);
        return this.prisma.service.update({
            where: { id },
            data: {
                isActive: !service.isActive,
                updatedAt: new Date(),
            },
        });
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceService);
//# sourceMappingURL=service.service.js.map