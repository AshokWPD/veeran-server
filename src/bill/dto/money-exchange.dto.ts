// bill/dto/money-exchange.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsObject,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MoneyExchangeType {
  BIOMETRIC_WITHDRAWAL = 'BIOMETRIC_WITHDRAWAL',
  CASH_TO_ONLINE = 'CASH_TO_ONLINE',
  ONLINE_TO_CASH = 'ONLINE_TO_CASH',
  ONLINE_TO_ONLINE = 'ONLINE_TO_ONLINE', // Add this
  GPAY_TRANSFER = 'GPAY_TRANSFER',
  MONEY_EXCHANGE = 'MONEY_EXCHANGE', // Keep this for backward compatibility
}

export enum CommissionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum CommissionDistributionMethod {
  DEDUCT_FROM_AMOUNT = 'DEDUCT_FROM_AMOUNT',
  SEPARATE_ONLINE = 'SEPARATE_ONLINE',
  SEPARATE_CASH = 'SEPARATE_CASH',
  SPLIT = 'SPLIT',
}

export class CommissionDistributionDto {
  @IsEnum(CommissionDistributionMethod)
  method: CommissionDistributionMethod;

  @IsNumber()
  @IsOptional()
  cashCommission?: number;

  @IsNumber()
  @IsOptional()
  digitalCommission?: number;

  @IsString()
  @IsOptional()
  digitalCommissionWalletId?: string;

  @IsString()
  @IsOptional()
  cashCommissionWalletId?: string;

  @IsNumber()
  @IsOptional()
  splitRatio?: number; // Percentage for cash (rest digital)
}

export class WalletSelectionDto {
  @IsString()
  primaryWalletId: string;

  @IsString()
  @IsOptional()
  secondaryWalletId?: string;

  @IsString()
  @IsOptional()
  commissionWalletId?: string;

  @IsString()
  @IsOptional()
  cashWalletId?: string;
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

  @ApiProperty({ type: WalletSelectionDto })
  @ValidateNested()
  @Type(() => WalletSelectionDto)
  walletSelection: WalletSelectionDto;

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
  @IsObject()
  metadata?: any; // Add this line
}

export class MoneyExchangeCalculationDto {
  principalAmount: number;
  commission: number;
  customerAmount: number;
  totalDebit: number;
  netAmount: number;
  profit: number;
  cashCommission: number;
  digitalCommission: number;
  commissionBreakdown: {
    method: CommissionDistributionMethod;
    description: string;
    customerReceives: number;
    weCollect: number;
    walletImpact: number;
  };
}


// Add these DTOs to your existing money-exchange.dto.ts

export class SimplifiedMoneyExchangeDto {
  @ApiProperty({ enum: MoneyExchangeType })
  @IsEnum(MoneyExchangeType)
  transactionType: MoneyExchangeType;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: CommissionType })
  @IsEnum(CommissionType)
  commissionType: CommissionType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  commissionValue: number;

  @ApiProperty()
  @IsString()
  ourWalletId: string; // Where money comes to us (online wallets)

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cashWalletId?: string; // Where we take cash from

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerWalletId?: string; // Where we send money to

  @ApiProperty({ enum: CommissionDistributionMethod })
  @IsEnum(CommissionDistributionMethod)
  commissionMethod: CommissionDistributionMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  commissionWalletId?: string; // For digital commission

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cashCommissionWalletId?: string; // For cash commission

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  splitCashAmount?: number;

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
  @IsObject()
  metadata?: any; // Add this line
}

// Enhanced response DTO
export class SimplifiedMoneyExchangeResponseDto {
  @ApiProperty()
  bill: any;

  @ApiProperty()
  calculations: MoneyExchangeCalculationDto;

  @ApiProperty()
  transactions: any[];

  @ApiProperty()
  walletBalances: {
    ourWallet: { id: string; name: string; newBalance: number };
    cashWallet?: { id: string; name: string; newBalance: number };
    customerWallet?: { id: string; name: string; newBalance: number };
    commissionWallet?: { id: string; name: string; newBalance: number };
    cashCommissionWallet?: { id: string; name: string; newBalance: number };
  };
}
