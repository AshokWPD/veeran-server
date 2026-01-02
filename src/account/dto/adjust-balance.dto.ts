import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum BalanceAdjustmentType {
  ADD = 'ADD',
  GET = 'GET',
}

export class AdjustBalanceDto {
  @ApiProperty({ description: 'Amount to adjust (positive for ADD, negative for GET)' })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({ enum: BalanceAdjustmentType, description: 'Type of adjustment' })
  @IsEnum(BalanceAdjustmentType)
  type: BalanceAdjustmentType;

  @ApiProperty({ required: false, description: 'Description of the transaction' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Reference number for tracking' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}