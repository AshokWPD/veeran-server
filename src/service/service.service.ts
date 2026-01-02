import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';
import { Service, Prisma } from '@prisma/client';
import {
  CreateServiceDto,
  ServiceCategory,
  ServiceType,
} from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import {
  ServiceAnalyticsQueryDto,
  ExportServicesQueryDto,
} from './dto/service-analytics.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    serviceType?: string;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Service[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      category,
      serviceType,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const where: Prisma.ServiceWhereInput = {};

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by service type
    if (serviceType) {
      where.serviceType = serviceType;
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    // Sort configuration
    const orderBy: Prisma.ServiceOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.defaultPrice = sortOrder;
    } else if (sortBy === 'category') {
      orderBy.category = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
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

  async findOne(id: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  private validateServiceData(data: CreateServiceDto): void {
    if (data.serviceType === ServiceType.PERCENTAGE_COMMISSION) {
      if (!data.commissionRate) {
        throw new BadRequestException(
          'Commission rate is required for percentage commission services',
        );
      }
      if (data.commissionRate < 0 || data.commissionRate > 100) {
        throw new BadRequestException(
          'Commission rate must be between 0 and 100',
        );
      }
    }

    if (data.serviceType === ServiceType.VARIABLE_PRICE) {
      if (data.minAmount && data.maxAmount && data.minAmount > data.maxAmount) {
        throw new BadRequestException(
          'Minimum amount cannot be greater than maximum amount',
        );
      }
    }

    // REMOVED: Online charge validation since amount will be set during bill creation
    // if (data.hasOnlineCharge && !data.onlineCharge) {
    //   throw new BadRequestException(
    //     'Online charge amount is required when hasOnlineCharge is true',
    //   );
    // }
  }

async create(data: CreateServiceDto): Promise<Service> {
  // Validate service type specific rules
  this.validateServiceData(data);

  const preparedData: any = {
    ...data,
    isActive: data.isActive ?? true,
    commissionRate: data.commissionRate || null,  // This line!
    minAmount: data.minAmount || null,
    maxAmount: data.maxAmount || null,
    onlineCharge: null,
  };

  return this.prisma.service.create({ data: preparedData });
}

  async update(id: string, data: UpdateServiceDto): Promise<Service> {
    await this.findOne(id);

    // Validate service type specific rules
    if (
      data.serviceType ||
      data.commissionRate ||
      data.minAmount ||
      data.maxAmount
    ) {
      const existingService = await this.findOne(id);
      const mergedData = { ...existingService, ...data };
      this.validateServiceData(mergedData as CreateServiceDto);
    }

    // Prepare update data
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // If hasOnlineCharge is being set to true, ensure onlineCharge is null
    if (data.hasOnlineCharge === true) {
      updateData.onlineCharge = null;
    }

    return this.prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<Service> {
    await this.findOne(id);

    // Check if service is used in any bills
    const billItemsCount = await this.prisma.billItem.count({
      where: { serviceId: id },
    });

    if (billItemsCount > 0) {
      throw new BadRequestException(
        'Cannot delete service that is used in bills. Deactivate it instead.',
      );
    }

    return this.prisma.service.delete({ where: { id } });
  }

  async exportServices(query: ExportServicesQueryDto) {
    const { format = 'csv', category, status } = query;

    const where: Prisma.ServiceWhereInput = {};
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
      const usageCount = service.billItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const totalRevenue = service.billItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      );

      return {
        name: service.name,
        code: service.name, // Using name as code since code field doesn't exist in Prisma
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
    } else {
      // CSV format
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

  async toggleServiceStatus(id: string): Promise<Service> {
    const service = await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data: {
        isActive: !service.isActive,
        updatedAt: new Date(),
      },
    });
  }
}