// src/dashboard/dto/dashboard.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accountId?: string;
}

export class QuickStatsDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  percent: number;

  @ApiProperty()
  color: string;

  @ApiProperty({ type: [Number] })
  chart: number[];
}

export class ServiceStatsDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  count: number;
}

export class WalletBalanceDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  balance: number;
}

export class RecentTransactionDto {
  @ApiProperty()
  icon: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  time: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  commission: number;
}

export class IncomeBreakdownDto {
  @ApiProperty({ type: [Number] })
  series: number[];

  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiProperty()
  details: Array<{ label: string; value: number }>;
}

export class DashboardResponseDto {
  @ApiProperty({ type: [QuickStatsDto] })
  quickStats: QuickStatsDto[];

  @ApiProperty()
  monthlyRevenue: {
    series: Array<{ name: string; data: number[] }>;
    categories: string[];
    percent: number;
  };

  @ApiProperty({ type: [ServiceStatsDto] })
  serviceStats: ServiceStatsDto[];

  @ApiProperty({ type: [WalletBalanceDto] })
  walletBalances: WalletBalanceDto[];

  @ApiProperty({ type: [RecentTransactionDto] })
  recentTransactions: RecentTransactionDto[];

  @ApiProperty()
  serviceIncome: IncomeBreakdownDto;
}