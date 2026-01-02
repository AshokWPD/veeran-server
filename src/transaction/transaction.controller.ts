// src/transaction/transaction.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import express from 'express';
import { TransactionService } from './transaction.service';
import { Transaction } from '@prisma/client';
import {
  CreateTransactionDto,
  CreateTransferDto,
  CreateMoneyExchangeDto,
  TransactionType,
  TransactionSubType,
  TransactionDirection,
  TransactionStatus,
  PaymentMethod,
  TransactionFilterDto,
} from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // FIXED: Moved static routes BEFORE dynamic routes to avoid route conflicts

  @Get('all')
  @ApiOperation({ summary: 'Get all transactions with advanced filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'subType', required: false, type: String })
  @ApiQuery({ name: 'direction', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String })
  @ApiQuery({ name: 'wallet', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAllWithFilters(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('accountId') accountId?: string,
    @Query('type') type?: string,
    @Query('subType') subType?: string,
    @Query('direction') direction?: string,
    @Query('status') status?: TransactionStatus,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('wallet') wallet?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const filters: TransactionFilterDto = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      accountId,
      type,
      subType,
      direction,
      status,
      paymentMethod,
      wallet,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
      sortBy,
      sortOrder,
    };

    return this.transactionService.findAllWithFilters(filters);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get transaction analytics for dashboard' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionService.getTransactionAnalytics({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
      type,
    });
  }

  @Get('wallets')
  @ApiOperation({ summary: 'Get all unique wallets for filtering' })
  getUniqueWallets() {
    return this.transactionService.getUniqueWallets();
  }

  @Get('summary/type')
  @ApiOperation({ summary: 'Get transaction summary by type' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getSummaryByType(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getTransactionSummaryByType({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all transaction types and subTypes' })
  getTransactionTypes() {
    return this.transactionService.getTransactionTypes();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get transaction trends for charts' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getTransactionTrends(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionService.getTransactionTrends({
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
    });
  }

  @Get('dashboard-cards')
  @ApiOperation({ summary: 'Get dashboard cards data' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getDashboardCards(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getDashboardCards(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('distribution')
  @ApiOperation({ summary: 'Get transaction distribution data' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['type', 'payment', 'wallet', 'status'] })
  async getTransactionDistribution(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'type' | 'payment' | 'wallet' | 'status',
  ) {
    return this.transactionService.getTransactionDistribution(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      groupBy,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getTransactionSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionService.getTransactionSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['hour', 'day', 'week', 'month'] })
  async getTransactionStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'hour' | 'day' | 'week' | 'month',
  ) {
    return this.transactionService.getTransactionStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy,
    });
  }

  @Get('wallet-performance')
  @ApiOperation({ summary: 'Get wallet performance data' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'walletIds', required: false, type: String, isArray: true })
  async getWalletPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('walletIds') walletIds?: string | string[],
  ) {
    // Handle both string and array inputs for walletIds
    const walletIdsArray = Array.isArray(walletIds) 
      ? walletIds 
      : walletIds 
        ? [walletIds]
        : undefined;
    
    return this.transactionService.getWalletPerformance(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      walletIdsArray,
    );
  }

  @Get('commission-analysis')
  @ApiOperation({ summary: 'Get commission analysis' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getCommissionAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.transactionService.getCommissionAnalysis(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      type,
    );
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentTransactions(@Query('limit') limit?: number) {
    return this.transactionService.getRecentTransactions(limit || 10);
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Compare transactions between two periods' })
  @ApiQuery({ name: 'period1Start', required: true, type: String })
  @ApiQuery({ name: 'period1End', required: true, type: String })
  @ApiQuery({ name: 'period2Start', required: true, type: String })
  @ApiQuery({ name: 'period2End', required: true, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getTransactionComparison(
    @Query('period1Start') period1Start: string,
    @Query('period1End') period1End: string,
    @Query('period2Start') period2Start: string,
    @Query('period2End') period2End: string,
    @Query('type') type?: string,
  ) {
    return this.transactionService.getTransactionComparison({
      period1Start: new Date(period1Start),
      period1End: new Date(period1End),
      period2Start: new Date(period2Start),
      period2End: new Date(period2End),
      type,
    });
  }

// Update the getTopPerformers method in transaction.controller.ts
@Get('top-performers')
@ApiOperation({ summary: 'Get top performing services/products' })
@ApiQuery({ name: 'startDate', required: false, type: String })
@ApiQuery({ name: 'endDate', required: false, type: String })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'type', required: false, enum: ['service', 'product', 'all'] })
async getTopPerformers(
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
  @Query('limit') limit?: string, // Accept as string first
  @Query('type') type?: 'service' | 'product' | 'all',
) {
  // Parse limit to number, default to 10 if not provided or invalid
  let limitNumber = 10;
  if (limit) {
    const parsed = parseInt(limit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      limitNumber = parsed;
    }
  }
  
  return this.transactionService.getTopPerformers(
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined,
    limitNumber, // Pass as number
    type || 'all',
  );
}
  @Post('money-exchange')
  @ApiOperation({
    summary:
      'Create money exchange transaction (Cash to Digital or vice versa)',
  })
  createMoneyExchange(@Body() createMoneyExchangeDto: CreateMoneyExchangeDto) {
    return this.transactionService.createMoneyExchange(createMoneyExchangeDto);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Download transaction receipt' })
  @ApiParam({ name: 'id', type: String })
  async downloadReceipt(@Param('id') id: string, @Res() res: express.Response) {
    try {
      const receipt = await this.transactionService.downloadReceipt(id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=receipt-${id}.pdf`);
      
      return res.send(receipt);
    } catch (error) {
      return res.status(404).json({
        message: error.message || 'Transaction not found',
        error: 'Not Found',
        statusCode: 404,
      });
    }
  }

  // FIXED: Moved :id route to the END to avoid conflicts with other routes
  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.transactionService.findOne(id);
  }
}