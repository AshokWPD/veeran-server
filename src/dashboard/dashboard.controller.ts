// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get complete dashboard data' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getDashboardData(query);
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick statistics for dashboard cards' })
  getQuickStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getQuickStats(query);
  }

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Get monthly revenue data for chart' })
  getMonthlyRevenue(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getMonthlyRevenue(query);
  }

  @Get('service-stats')
  @ApiOperation({ summary: 'Get service statistics' })
  getServiceStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getServiceStats(query);
  }

  @Get('wallet-balances')
  @ApiOperation({ summary: 'Get all wallet balances' })
  getWalletBalances() {
    return this.dashboardService.getWalletBalances();
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Get recent transactions' })
  getRecentTransactions(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRecentTransactions(query);
  }

  @Get('income-breakdown')
  @ApiOperation({ summary: 'Get income breakdown by service category' })
  getIncomeBreakdown(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getIncomeBreakdown(query);
  }
}