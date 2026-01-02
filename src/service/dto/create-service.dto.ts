import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export enum ServiceCategory {
  BANKING = 'BANKING',
  MONEY = 'MONEY',
  DIGITAL = 'DIGITAL',
  ONLINE = 'ONLINE',
  PRINTING = 'PRINTING',
  XEROX = 'XEROX',
  LAMINATION = 'LAMINATION',
  PRODUCT = 'PRODUCT',
}

export enum ServiceType {
  FIXED_PRICE = 'FIXED_PRICE',
  PERCENTAGE_COMMISSION = 'PERCENTAGE_COMMISSION',
  VARIABLE_PRICE = 'VARIABLE_PRICE',
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ServiceCategory, description: 'Service category' })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({ enum: ServiceType, description: 'Service type' })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ description: 'Default price for the service' })
  @IsNumber()
  @Min(0)
  defaultPrice: number;

  @ApiPropertyOptional({ description: 'Commission rate for percentage services' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commissionRate?: number;

  @ApiPropertyOptional({ description: 'Minimum amount for variable price services' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum amount for variable price services' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Whether service has online charge' })
  @IsBoolean()
  @IsOptional()
  hasOnlineCharge?: boolean;

  @ApiPropertyOptional({ description: 'Online charge amount - will be set during bill creation' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  onlineCharge?: number;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Service instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Whether service is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsString,
//   IsNotEmpty,
//   IsOptional,
//   IsNumber,
//   IsBoolean,
//   IsEnum,
// } from 'class-validator';

// export enum ServiceCategory {
//   BANKING = 'Banking',
//   DIGITAL = 'Digital',
//   PRINTING = 'Printing',
//   MONEY = 'money',
//   ONLINE = 'online',
//   PRODUCT = 'product',
//   XEROX = 'Xerox',
//   LAMINATION = 'Lamination',
// }

// export enum ServiceType {
//   FIXED_PRICE = 'FIXED_PRICE',
//   PERCENTAGE_COMMISSION = 'PERCENTAGE_COMMISSION',
//   VARIABLE_PRICE = 'VARIABLE_PRICE',
// }

// export class CreateServiceDto {
//   @ApiProperty({ example: 'Biometric Cash Withdrawal' })
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.BANKING })
//   @IsEnum(ServiceCategory)
//   @IsNotEmpty()
//   category: ServiceCategory;

//   @ApiProperty({
//     enum: ServiceType,
//     example: ServiceType.PERCENTAGE_COMMISSION,
//   })
//   @IsEnum(ServiceType)
//   @IsNotEmpty()
//   serviceType: ServiceType;

//   @ApiProperty({ example: 0 })
//   @IsNumber()
//   defaultPrice: number;

//   @ApiProperty({ example: 2.0, required: false })
//   @IsNumber()
//   @IsOptional()
//   commissionRate?: number;

//   @ApiProperty({ example: 100, required: false })
//   @IsNumber()
//   @IsOptional()
//   minAmount?: number;

//   @ApiProperty({ example: 10000, required: false })
//   @IsNumber()
//   @IsOptional()
//   maxAmount?: number;

//   @ApiProperty({ example: false, required: false })
//   @IsBoolean()
//   @IsOptional()
//   hasOnlineCharge?: boolean;

//   @ApiProperty({ example: 5, required: false })
//   @IsNumber()
//   @IsOptional()
//   onlineCharge?: number;

//   @ApiProperty({
//     example: 'Withdraw cash via biometric authentication',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   description?: string;

//   @ApiProperty({
//     example:
//       '1. Verify customer ID\n2. Process biometric\n3. Collect commission\n4. Hand over cash',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   instructions?: string;

//   @ApiProperty({ example: true, required: false })
//   @IsBoolean()
//   @IsOptional()
//   isActive?: boolean;
// }
