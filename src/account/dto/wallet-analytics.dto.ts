// account/dto/wallet-analytics.dto.ts - ADD THESE DTOs

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class WalletAnalyticsQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class WalletAnalyticsResponseDto {
  @ApiProperty()
  totalBalance: number;

  @ApiProperty()
  totalWallets: number;

  @ApiProperty()
  activeWallets: number;

  @ApiProperty()
  highestBalance: string;

  @ApiProperty()
  balanceByType: Record<string, number>;

  @ApiProperty()
  recentTransactions: any[];

  @ApiProperty()
  walletDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export class FundTransferDto {
  @ApiProperty()
  @IsString()
  fromAccountId: string;

  @ApiProperty()
  @IsString()
  toAccountId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  commission?: number;
}

// Money Exchange DTOs
export enum MoneyExchangeType {
  BIOMETRIC_WITHDRAWAL = 'BIOMETRIC_WITHDRAWAL',
  GPAY_TRANSFER = 'GPAY_TRANSFER',
  CASH_TO_GPAY = 'CASH_TO_GPAY',
  GPAY_TO_CASH = 'GPAY_TO_CASH',
}

export enum CommissionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum CommissionDistributionMethod {
  DEDUCT_FROM_AMOUNT = 'DEDUCT_FROM_AMOUNT',
  SEPARATE_CASH = 'SEPARATE_CASH',
  SEPARATE_DIGITAL = 'SEPARATE_DIGITAL',
  SPLIT = 'SPLIT',
}

export class CommissionDistributionDto {
  @ApiProperty({ enum: CommissionDistributionMethod })
  @IsEnum(CommissionDistributionMethod)
  method: CommissionDistributionMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cashCommission?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  digitalCommission?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  digitalCommissionWalletId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cashCommissionWalletId?: string;
}

export class CreateMoneyExchangeDto {
  @ApiProperty({ enum: MoneyExchangeType })
  @IsEnum(MoneyExchangeType)
  transactionType: MoneyExchangeType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  principalAmount: number;

  @ApiProperty({ enum: CommissionType })
  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  commissionValue: number;

  @ApiProperty({ type: CommissionDistributionDto })
  @ValidateNested()
  @Type(() => CommissionDistributionDto)
  commissionDistribution: CommissionDistributionDto;

  @ApiProperty()
  @IsString()
  sourceAccountId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  destinationAccountId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}


export class MoneyExchangeCalculationDto {
  @ApiProperty()
  principalAmount: number;

  @ApiProperty()
  commission: number;

  @ApiProperty()
  customerAmount: number;

  @ApiProperty()
  totalDebit: number;

  @ApiProperty()
  netAmount: number;

  @ApiProperty()
  profit: number;

  @ApiProperty()
  cashCommission: number;

  @ApiProperty()
  digitalCommission: number;
}

export class MoneyExchangeResponseDto {
  @ApiProperty()
  transaction: any;

  @ApiProperty()
  sourceTransaction: any;

  @ApiProperty({ required: false })
  destinationTransaction?: any;

  @ApiProperty()
  calculations: MoneyExchangeCalculationDto;

  @ApiProperty()
  bill: any;
}
