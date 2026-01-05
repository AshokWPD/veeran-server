import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import express from 'express';
import { ServiceService } from './service.service';
import { Service } from '@prisma/client';
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { BillNotificationInterceptor } from '../bill/interceptors/bill-notification.interceptor';


@ApiTags('services')
@Controller('services')
@UseInterceptors(BillNotificationInterceptor)

export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, enum: ServiceCategory })
  @ApiQuery({ name: 'serviceType', required: false, enum: ServiceType })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'category', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('serviceType') serviceType?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.serviceService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
      serviceType,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick statistics for dashboard' })
  getQuickStats() {
    return this.serviceService.getQuickStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id') id: string): Promise<Service> {
    return this.serviceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceService.create(createServiceDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 404, description: 'Service not found' })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Service deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete service used in bills',
  })
  remove(@Param('id') id: string): Promise<Service> {
    return this.serviceService.remove(id);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export services data' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'excel', 'json'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async exportServices(
    @Query() query: ExportServicesQueryDto,
    @Res() res: express.Response,
  ) {
    const { data, filename, contentType } =
      await this.serviceService.exportServices(query);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (query.format === 'json') {
      res.send(data);
    } else {
      res.send(data);
    }
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle service active status' })
  @ApiParam({ name: 'id', type: String })
  toggleServiceStatus(@Param('id') id: string) {
    return this.serviceService.toggleServiceStatus(id);
  }
}
