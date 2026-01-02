// service/dto/service-analytics.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ServiceAnalyticsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ServiceAnalyticsResponseDto {
  @ApiProperty()
  totalServices: number;

  @ApiProperty()
  activeServices: number;

  @ApiProperty()
  totalRevenuePotential: number;

  @ApiProperty()
  popularService: string;

  @ApiProperty()
  usageByCategory: Record<string, number>;

  @ApiProperty()
  revenueByCategory: Record<string, number>;

  @ApiProperty()
  topServices: Array<{
    id: string;
    name: string;
    usageCount: number;
    totalRevenue: number;
  }>;
}

export class ServiceUsageStatsDto {
  @ApiProperty()
  serviceId: string;

  @ApiProperty()
  serviceName: string;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  lastUsed: Date;
}

export class ExportServicesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  format?: 'csv' | 'excel' | 'json';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}