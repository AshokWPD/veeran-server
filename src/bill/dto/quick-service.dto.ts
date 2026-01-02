import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CartItemDto {
  @ApiProperty({ description: 'Item ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Item price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Item quantity' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Item code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  // UPDATED: Renamed from platformFee to onlinePaymentAmount
  @ApiPropertyOptional({ description: 'Online payment amount (amount to deduct from wallet)' })
  @IsNumber()
  @IsOptional()
  onlinePaymentAmount?: number;

  // UPDATED: Renamed from requiresAccount to requiresOnlinePayment
  @ApiPropertyOptional({ description: 'Whether requires online payment' })
  @IsBoolean()
  @IsOptional()
  requiresOnlinePayment?: boolean;

  // KEEP existing account fields for backward compatibility
  @ApiPropertyOptional({ description: 'Account amount' })
  @IsNumber()
  @IsOptional()
  accountAmount?: number;

  @ApiPropertyOptional({ description: 'Selected account ID' })
  @IsString()
  @IsOptional()
  selectedAccountId?: string;

  @ApiPropertyOptional({ description: 'Selected account name' })
  @IsString()
  @IsOptional()
  selectedAccountName?: string;

  @ApiPropertyOptional({ description: 'Total amount' })
  @IsNumber()
  @IsOptional()
  total?: number;

  // UPDATED: Renamed from platformFeeTotal to onlinePaymentTotal
  @ApiPropertyOptional({ description: 'Online payment total (amount to deduct from wallet)' })
  @IsNumber()
  @IsOptional()
  onlinePaymentTotal?: number;

  // KEEP existing account fields for backward compatibility
  @ApiPropertyOptional({ description: 'Account amount total' })
  @IsNumber()
  @IsOptional()
  accountAmountTotal?: number;

  // UPDATED: Renamed from onlineChargeWalletId to onlinePaymentWalletId
  @ApiPropertyOptional({ description: 'Online payment wallet ID (wallet to deduct from)' })
  @IsString()
  @IsOptional()
  onlinePaymentWalletId?: string;

  // UPDATED: Renamed from onlineChargeWalletName to onlinePaymentWalletName
  @ApiPropertyOptional({ description: 'Online payment wallet name' })
  @IsString()
  @IsOptional()
  onlinePaymentWalletName?: string;

  // ADD service type fields for profit calculation
  @ApiPropertyOptional({ description: 'Service type' })
  @IsString()
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Has online payment capability' })
  @IsBoolean()
  @IsOptional()
  hasOnlinePayment?: boolean;
}

export class PaymentSplitDto {
  @ApiProperty({ description: 'Payment method' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'Wallet account ID' })
  @IsString()
  @IsOptional()
  walletAccountId?: string;
}

export class CreateQuickServiceBillDto {
  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ type: [CartItemDto], description: 'Bill items' })
  @IsNotEmpty()
  items: CartItemDto[];

  @ApiProperty({ description: 'Payment method' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ type: [PaymentSplitDto], description: 'Payment splits' })
  @IsNotEmpty()
  paymentSplits: PaymentSplitDto[];

  @ApiProperty({ description: 'Account ID' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Auto calculate profit' })
  @IsBoolean()
  @IsOptional()
  autoCalculateProfit?: boolean;
}

// UPDATED: QuickServiceCalculationDto with new field names
export class QuickServiceCalculationDto {
  @ApiProperty({ description: 'Subtotal (service prices only)' })
  subtotal: number;

  @ApiProperty({ description: 'Online payments (amounts to deduct from wallets)' })
  onlinePayments: number;

  @ApiProperty({ description: 'Account spend (for backward compatibility)' })
  accountSpend: number;

  @ApiProperty({ description: 'Total amount (subtotal + online payments)' })
  total: number;

  @ApiProperty({ description: 'Commission' })
  commission: number;

  @ApiProperty({ description: 'Profit' })
  profit: number;
}