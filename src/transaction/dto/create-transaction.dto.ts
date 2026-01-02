import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';

// dto/create-transaction.dto.ts
export enum TransactionType {
  MONEY_EXCHANGE = 'MONEY_EXCHANGE',
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
  SELF_TRANSFER = 'SELF_TRANSFER',
  COMMISSION = 'COMMISSION',
  PURCHASE = 'PURCHASE',
}

export enum TransactionSubType {
  BIO_METRIC_WITHDRAWAL = 'BIO_METRIC_WITHDRAWAL',
  GPAY_TRANSFER = 'GPAY_TRANSFER',
  CASH_TO_GPAY = 'CASH_TO_GPAY',
  GPAY_TO_CASH = 'GPAY_TO_CASH',
  PRINTING = 'PRINTING',
  ONLINE_SERVICE = 'ONLINE_SERVICE',
  STATIONERY = 'STATIONERY',
  LAMINATION = 'LAMINATION',
  XEROX = 'XEROX',
  BILL_PAYMENT = 'BILL_PAYMENT',
}

export enum PaymentMethod {
  CASH = 'CASH',
  GPAY = 'GPAY',
  WALLET = 'WALLET',
  CARD = 'CARD',
  PORTER = 'PORTER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class CreateTransactionDto {
  accountId: string;
  amount: number;
  direction: TransactionDirection;
  type: TransactionType;
  subType?: TransactionSubType;
  description?: string;
  status?: TransactionStatus;
  referenceNumber?: string;
  relatedAccountId?: string;
  commission?: number;
  netAmount?: number;
  profit?: number;
  metadata?: Record<string, any>;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  wallet?: string;
  billId?: string;
}

export class TransactionFilterDto {
  page?: number;
  limit?: number;
  accountId?: string;
  type?: string; // Changed from TransactionType to string for flexibility
  subType?: string; // Changed from TransactionSubType to string
  direction?: string; // Changed from TransactionDirection to string
  status?: TransactionStatus;
  paymentMethod?: string; // Changed from PaymentMethod to string
  wallet?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export enum TransactionDirection {
  IN = 'IN',
  OUT = 'OUT',
}

// export class CreateTransactionDto {
//   @ApiProperty({ example: 'account-uuid' })
//   @IsString()
//   @IsNotEmpty()
//   accountId: string;

//   @ApiProperty({ example: 1000 })
//   @IsNumber()
//   @IsNotEmpty()
//   amount: number;

//   @ApiProperty({ enum: TransactionDirection, example: TransactionDirection.IN })
//   @IsEnum(TransactionDirection)
//   @IsNotEmpty()
//   direction: TransactionDirection;

//   @ApiProperty({
//     enum: TransactionType,
//     example: TransactionType.MONEY_EXCHANGE,
//   })
//   @IsEnum(TransactionType)
//   @IsNotEmpty()
//   type: TransactionType;

//   @ApiProperty({
//     enum: TransactionSubType,
//     example: TransactionSubType.CASH_TO_GPAY,
//     required: false,
//   })
//   @IsEnum(TransactionSubType)
//   @IsOptional()
//   subType?: TransactionSubType;

//   @ApiProperty({
//     example: 'Customer gave cash for GPay transfer',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   description?: string;

//   @ApiProperty({
//     enum: TransactionStatus,
//     example: TransactionStatus.COMPLETED,
//     required: false,
//   })
//   @IsEnum(TransactionStatus)
//   @IsOptional()
//   status?: TransactionStatus;

//   @ApiProperty({ example: 'TXN001', required: false })
//   @IsString()
//   @IsOptional()
//   referenceNumber?: string;

//   @ApiProperty({ example: 'related-account-uuid', required: false })
//   @IsString()
//   @IsOptional()
//   relatedAccountId?: string;

//   @ApiProperty({ example: 20, required: false })
//   @IsNumber()
//   @IsOptional()
//   commission?: number;

//   @ApiProperty({ example: 980, required: false })
//   @IsNumber()
//   @IsOptional()
//   netAmount?: number;

//   @ApiProperty({ example: 15, required: false })
//   @IsNumber()
//   @IsOptional()
//   profit?: number;

//   @ApiProperty({
//     example: { customerPhone: '9876543210', porterWallet: 'Porter1' },
//     required: false,
//   })
//   @IsObject()
//   @IsOptional()
//   metadata?: Record<string, any>;

//   @ApiProperty({ example: 'bill-uuid', required: false })
//   @IsString()
//   @IsOptional()
//   billId?: string;
// }

export class CreateTransferDto {
  @ApiProperty({ example: 'from-account-uuid' })
  @IsString()
  @IsNotEmpty()
  fromAccountId: string;

  @ApiProperty({ example: 'to-account-uuid' })
  @IsString()
  @IsNotEmpty()
  toAccountId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Transfer between wallets', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  commission?: number;
}

export class CreateMoneyExchangeDto {
  @ApiProperty({ example: 'cash-account-uuid' })
  @IsString()
  @IsNotEmpty()
  cashAccountId: string;

  @ApiProperty({ example: 'gpay-account-uuid' })
  @IsString()
  @IsNotEmpty()
  digitalAccountId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsNotEmpty()
  commission: number;

  @ApiProperty({
    example: 'Customer gave cash for GPay transfer',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: {
      customerPhone: '9876543210',
      commissionType: 'DEDUCT_FROM_AMOUNT',
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
