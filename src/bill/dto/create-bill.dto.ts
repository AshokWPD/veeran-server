import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMode {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CREDIT = 'CREDIT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum BillStatus {
  ACTIVE = 'ACTIVE',
  VOID = 'VOID',
  REFUNDED = 'REFUNDED',
  DELETED = 'DELETED',
}

export class BillItemDto {
  @ApiProperty({ description: 'Service ID (optional for non-service items)' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  itemName: string;

  @ApiProperty({ description: 'Item type (SERVICE, PRODUCT, etc.)' })
  @IsString()
  itemType: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Cost price (optional)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'Commission amount (auto-calculated if not provided)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commission?: number;

  @ApiProperty({ description: 'Profit amount (auto-calculated if not provided)' })
  @IsOptional()
  @IsNumber()
  profit?: number;

  @ApiProperty({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;
}

export class CreateBillDto {
  @ApiProperty({ description: 'Customer ID (optional if creating new customer)' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: 'Customer name (required if creating new customer)' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Customer phone (required if creating new customer)' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ enum: PaymentMode, description: 'Payment mode' })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @ApiProperty({ description: 'Account ID for receiving payment' })
  @IsString()
  accountId: string;

  @ApiProperty({ type: [BillItemDto], description: 'Bill items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];

  @ApiProperty({ description: 'Tax amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number = 0;

  @ApiProperty({ description: 'Discount amount', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number = 0;

  @ApiProperty({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Auto calculate profit and commission', default: true })
  @IsOptional()
  @IsBoolean()
  autoCalculateProfit?: boolean = true;
}

export class UpdateBillStatusDto {
  @ApiProperty({ enum: PaymentStatus, description: 'New payment status' })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: BillStatus, description: 'New bill status' })
  @IsEnum(BillStatus)
  billStatus: BillStatus;

  @ApiProperty({ description: 'Notes for status change' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RefundBillDto {
  @ApiProperty({ description: 'Account ID for refund' })
  @IsString()
  refundAccountId: string;

  @ApiProperty({ description: 'Refund amount (full or partial)' })
  @IsNumber()
  @Min(0)
  refundAmount: number;

  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}