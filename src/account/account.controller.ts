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
  UseInterceptors,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  FundTransferDto,
  WalletAnalyticsQueryDto,
} from './dto/wallet-analytics.dto';
import { AdjustBalanceDto, BalanceAdjustmentType } from './dto/adjust-balance.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BillNotificationInterceptor } from '../bill/interceptors/bill-notification.interceptor';

@ApiTags('accounts')
@Controller('accounts')
@UseInterceptors(BillNotificationInterceptor)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'balance', 'type', 'createdAt'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns paginated accounts' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('isActive') isActive?: string,
  ) {
    return this.accountService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      type,
      search,
      sortBy,
      sortOrder,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get wallet analytics summary' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getWalletAnalytics(@Query() query: WalletAnalyticsQueryDto) {
    return this.accountService.getWalletAnalytics(query);
  }

  @Get('wallet/active')
  @ApiOperation({ summary: 'Get all active wallets for transfers' })
  getActiveWallets() {
    return this.accountService.getActiveWallets();
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds between accounts' })
  @ApiResponse({ status: 201, description: 'Funds transferred successfully' })
  transferFunds(@Body() transferData: FundTransferDto) {
    return this.accountService.transferFunds(transferData);
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle account active status' })
  @ApiParam({ name: 'id', type: String })
  toggleAccountStatus(@Param('id') id: string) {
    return this.accountService.toggleAccountStatus(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 404, description: 'Account not found' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }

  @Post(':id/adjust-balance')
  @ApiOperation({ summary: 'Add or get money from wallet' })
  @ApiParam({ name: 'id', type: String, description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Balance adjusted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Invalid amount or insufficient balance' })
  async adjustBalance(
    @Param('id') id: string,
    @Body() adjustBalanceDto: AdjustBalanceDto,
  ) {
    return this.accountService.adjustBalance(id, adjustBalanceDto);
  }

@Post(':id/add-money')
@ApiOperation({ summary: 'Add money to wallet' })
@ApiParam({ name: 'id', type: String, description: 'Account ID' })
@ApiResponse({ status: 200, description: 'Money added successfully' })
@ApiResponse({ status: 404, description: 'Account not found' })
async addMoney(
  @Param('id') id: string,
  @Body() data: { amount: number; description?: string; referenceNumber?: string },
) {
  const adjustBalanceDto: AdjustBalanceDto = {
    amount: data.amount,
    type: BalanceAdjustmentType.ADD, // Use enum instead of string
    description: data.description,
    referenceNumber: data.referenceNumber,
  };
  return this.accountService.adjustBalance(id, adjustBalanceDto);
}

@Post(':id/get-money')
@ApiOperation({ summary: 'Get money from wallet' })
@ApiParam({ name: 'id', type: String, description: 'Account ID' })
@ApiResponse({ status: 200, description: 'Money retrieved successfully' })
@ApiResponse({ status: 404, description: 'Account not found' })
@ApiResponse({ status: 400, description: 'Insufficient balance' })
async getMoney(
  @Param('id') id: string,
  @Body() data: { amount: number; description?: string; referenceNumber?: string },
) {
  const adjustBalanceDto: AdjustBalanceDto = {
    amount: data.amount,
    type: BalanceAdjustmentType.GET, // Use enum instead of string
    description: data.description,
    referenceNumber: data.referenceNumber,
  };
  return this.accountService.adjustBalance(id, adjustBalanceDto);
}
}