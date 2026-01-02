// account/dto/create-account.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'Porter Wallet 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Wallet' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'PW001', required: false })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiProperty({ example: 'Shop Owner', required: false })
  @IsString()
  @IsOptional()
  holderName?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // ADD THIS FIELD
  @ApiProperty({ example: 'Main wallet for daily transactions', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}