import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateBillItemDto {
  @ApiProperty({ required: false, example: 'service-uuid' })
  @IsString()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ required: false, example: 'product-uuid' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 10.0, required: false })
  @IsNumber()
  @IsOptional()
  commission?: number;
}
