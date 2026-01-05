import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { BillService } from './bill.service';
import {
  CreateBillDto,
  UpdateBillStatusDto,
  RefundBillDto,
  PaymentMode,
  PaymentStatus,
  BillStatus,
} from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import {
  CreateQuickServiceBillDto,
  QuickServiceCalculationDto,
} from './dto/quick-service.dto';
import {
  CreateMoneyExchangeDto,
  MoneyExchangeCalculationDto,
  // MoneyExchangeResponseDto,
  SimplifiedMoneyExchangeDto,
  SimplifiedMoneyExchangeResponseDto,
} from './dto/money-exchange.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { BillNotificationInterceptor } from './interceptors/bill-notification.interceptor';



@ApiTags('bills')
@Controller('bills')
@UseInterceptors(BillNotificationInterceptor)
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bills with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'customerPhone', required: false, type: String })
  @ApiQuery({ name: 'paymentMode', required: false, enum: PaymentMode })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'billStatus', required: false, enum: BillStatus })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'totalAmount', 'billNumber'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
    @Query('customerPhone') customerPhone?: string,
    @Query('paymentMode') paymentMode?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('billStatus') billStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.billService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      customerId,
      customerPhone,
      paymentMode,
      paymentStatus,
      billStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bill by ID' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  create(@Body() createBillDto: CreateBillDto) {
    return this.billService.create(createBillDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bill' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete paid bill' })
  remove(@Param('id') id: string) {
    return this.billService.delete(id);
  }

  @Post('quick-service')
  @ApiOperation({ summary: 'Create a quick service bill' })
  @ApiResponse({
    status: 201,
    description: 'Quick service bill created successfully',
  })
  createQuickService(
    @Body() createQuickServiceBillDto: CreateQuickServiceBillDto,
  ) {
    return this.billService.createQuickServiceBill(createQuickServiceBillDto);
  }



  @Get('today/summary')
  @ApiOperation({ summary: "Get today's billing summary" })
  getTodaySummary() {
    return this.billService.getTodaySummary();
  }

  @Get('recent/quick-services')
  @ApiOperation({ summary: 'Get recent quick service bills' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentQuickServices(@Query('limit') limit?: string) {
    return this.billService.getRecentQuickServices(
      limit ? parseInt(limit, 10) : 10,
    );
  }


  // In bill.controller.ts
@Post('simplified-money-exchange')
@ApiOperation({ summary: 'Create simplified money exchange transaction' })
@ApiResponse({
  status: 201,
  description: 'Simplified money exchange completed successfully',
})
createSimplifiedMoneyExchange(
  @Body() simplifiedMoneyExchangeDto: SimplifiedMoneyExchangeDto,
) {
  // Call the bill service method instead of moneyExchangeService
  return this.billService.createSimplifiedMoneyExchange(
    simplifiedMoneyExchangeDto,
  );
}

  // @Post('simplified-money-exchange')
  // @ApiOperation({ summary: 'Create simplified money exchange transaction' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Simplified money exchange completed successfully',
  // })
  // createSimplifiedMoneyExchange(
  //   @Body() simplifiedMoneyExchangeDto: SimplifiedMoneyExchangeDto,
  // ) {
  //   return this.billService.createSimplifiedMoneyExchange(
  //     simplifiedMoneyExchangeDto,
  //   );
  // }
}