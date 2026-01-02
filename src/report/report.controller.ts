import { Controller, Get, Query } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('financial-summary')
  async financialSummary(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return this.reportService.financialSummary(startDate, endDate);
  }

  @Get('top-services')
  async topServices(@Query('limit') limit?: string) {
    return this.reportService.topServices(limit ? parseInt(limit) : undefined);
  }

  @Get('account-balances')
  async accountBalances() {
    return this.reportService.accountBalances();
  }
}
