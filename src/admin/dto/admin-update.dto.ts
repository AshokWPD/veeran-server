import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminUpdateDto {
  @ApiPropertyOptional({ example: 'Admin User Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'updated_player_id_from_one_signal' })
  @IsOptional()
  @IsString()
  playerId?: string;
}