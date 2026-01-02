import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  FundTransferDto,
  WalletAnalyticsQueryDto,
} from './dto/wallet-analytics.dto';
import { AdjustBalanceDto, BalanceAdjustmentType } from './dto/adjust-balance.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      type,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      isActive,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { accountNumber: { contains: search } },
        { holderName: { contains: search } },
      ];
    }

    // Sort configuration
    const orderBy: any = {};
    if (sortBy === 'balance') {
      orderBy.balance = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'type') {
      orderBy.type = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.account.count({ where }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async create(data: CreateAccountDto) {
    return this.prisma.account.create({ data });
  }

  async update(id: string, data: UpdateAccountDto) {
    await this.findOne(id);
    return this.prisma.account.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.account.delete({ where: { id } });
  }

  async getWalletAnalytics(query: WalletAnalyticsQueryDto) {
    const { startDate, endDate } = query;

    const where: any = {};
    const transactionWhere: any = {};

    if (startDate || endDate) {
      transactionWhere.createdAt = {};
      if (startDate) transactionWhere.createdAt.gte = new Date(startDate);
      if (endDate) transactionWhere.createdAt.lte = new Date(endDate);
    }

    try {
      // Get all accounts
      const accounts = await this.prisma.account.findMany({
        where,
        include: {
          transactions: {
            where: transactionWhere,
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      // Handle empty accounts case
      if (accounts.length === 0) {
        return {
          totalBalance: 0,
          totalWallets: 0,
          activeWallets: 0,
          highestBalance: null,
          balanceByType: {},
          walletDistribution: [],
          recentTransactions: [],
        };
      }

      // Calculate analytics with safe reduce operations
      const totalBalance = accounts.reduce(
        (sum, account) => sum + (account.balance || 0),
        0,
      );

      const totalWallets = accounts.length;
      const activeWallets = accounts.filter(
        (account) => account.isActive,
      ).length;

      // Safe highest balance account calculation
      const highestBalanceAccount = accounts.reduce(
        (prev, current) =>
          (prev.balance || 0) > (current.balance || 0) ? prev : current,
        accounts[0],
      );

      // Balance by type with safe reduce
      const balanceByType = accounts.reduce(
        (acc, account) => {
          const type = account.type || 'Unknown';
          acc[type] = (acc[type] || 0) + (account.balance || 0);
          return acc;
        },
        {} as Record<string, number>,
      );

      // Wallet distribution by type with safe reduce
      const walletDistribution = Object.entries(
        accounts.reduce(
          (acc, account) => {
            const type = account.type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      ).map(([type, count]) => ({
        type,
        count,
        percentage:
          totalWallets > 0 ? Math.round((count / totalWallets) * 100) : 0,
      }));

      // Recent transactions from all accounts
      const recentTransactions = await this.prisma.transaction.findMany({
        where: transactionWhere,
        include: {
          account: true,
          relatedAccount: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      return {
        totalBalance,
        totalWallets,
        activeWallets,
        highestBalance: highestBalanceAccount?.name || null,
        highestBalanceAmount: highestBalanceAccount?.balance || 0,
        balanceByType,
        walletDistribution,
        recentTransactions: recentTransactions.map((tx) => ({
          id: tx.id,
          accountName: tx.account?.name || 'Unknown Account',
          type: tx.type,
          subType: tx.subType,
          amount: tx.amount || 0,
          direction: tx.direction,
          description: tx.description,
          createdAt: tx.createdAt,
          relatedAccountName: tx.relatedAccount?.name,
        })),
      };
    } catch (error) {
      console.error('Error in getWalletAnalytics:', error);

      // Return default structure in case of error
      return {
        totalBalance: 0,
        totalWallets: 0,
        activeWallets: 0,
        highestBalance: null,
        balanceByType: {},
        walletDistribution: [],
        recentTransactions: [],
        error: 'Failed to fetch wallet analytics',
      };
    }
  }

  async getActiveWallets() {
    return this.prisma.account.findMany({
      where: {
        isActive: true,
        type: { in: ['Wallet', 'Porter', 'GPay', 'Cash', 'Bank'] },
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        accountNumber: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async transferFunds(transferData: FundTransferDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verify both accounts exist and are active
      const [fromAccount, toAccount] = await Promise.all([
        tx.account.findUnique({ where: { id: transferData.fromAccountId } }),
        tx.account.findUnique({ where: { id: transferData.toAccountId } }),
      ]);

      if (!fromAccount || !toAccount) {
        throw new NotFoundException('One or both accounts not found');
      }

      if (!fromAccount.isActive || !toAccount.isActive) {
        throw new BadRequestException('One or both accounts are inactive');
      }

      if (fromAccount.balance < transferData.amount) {
        throw new BadRequestException('Insufficient balance in source account');
      }

      const commission = transferData.commission || 0;
      const netAmount = transferData.amount - commission;

      // Create outgoing transaction
      const outgoingTransaction = await tx.transaction.create({
        data: {
          accountId: transferData.fromAccountId,
          amount: transferData.amount,
          direction: 'OUT',
          type: 'SELF_TRANSFER',
          subType: 'INTER_ACCOUNT_TRANSFER',
          description:
            transferData.description || `Transfer to ${toAccount.name}`,
          relatedAccountId: transferData.toAccountId,
          commission: commission,
          netAmount: netAmount,
          status: 'COMPLETED',
        },
      });

      // Create incoming transaction
      const incomingTransaction = await tx.transaction.create({
        data: {
          accountId: transferData.toAccountId,
          amount: netAmount,
          direction: 'IN',
          type: 'SELF_TRANSFER',
          subType: 'INTER_ACCOUNT_TRANSFER',
          description:
            transferData.description || `Transfer from ${fromAccount.name}`,
          relatedAccountId: transferData.fromAccountId,
          commission: 0,
          netAmount: netAmount,
          status: 'COMPLETED',
        },
      });

      // Update account balances
      await tx.account.update({
        where: { id: transferData.fromAccountId },
        data: { balance: { decrement: transferData.amount } },
      });

      await tx.account.update({
        where: { id: transferData.toAccountId },
        data: { balance: { increment: netAmount } },
      });

      return {
        outgoingTransaction,
        incomingTransaction,
        fromAccount: {
          ...fromAccount,
          newBalance: fromAccount.balance - transferData.amount,
        },
        toAccount: {
          ...toAccount,
          newBalance: toAccount.balance + netAmount,
        },
      };
    });
  }

  async toggleAccountStatus(id: string) {
    const account = await this.findOne(id);

    return this.prisma.account.update({
      where: { id },
      data: {
        isActive: !account.isActive,
        updatedAt: new Date(),
      },
    });
  }

  async adjustBalance(id: string, adjustBalanceDto: AdjustBalanceDto) {
    return this.prisma.$transaction(async (tx) => {
      // Verify account exists and is active
      const account = await tx.account.findUnique({ where: { id } });
      
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (!account.isActive) {
        throw new BadRequestException('Account is inactive');
      }

      const { amount, type, description, referenceNumber } = adjustBalanceDto;
      let newBalance: number;
      let transactionAmount: number;
      let transactionDirection: string;
      let transactionType: string;

      if (type === BalanceAdjustmentType.ADD) {
        // Add money to account
        newBalance = account.balance + amount;
        transactionAmount = amount;
        transactionDirection = 'IN';
        transactionType = 'BALANCE_ADD';
      } else {
        // GET money from account
        if (account.balance < amount) {
          throw new BadRequestException('Insufficient balance');
        }
        newBalance = account.balance - amount;
        transactionAmount = amount;
        transactionDirection = 'OUT';
        transactionType = 'BALANCE_WITHDRAW';
      }

      // Update account balance
      const updatedAccount = await tx.account.update({
        where: { id },
        data: { 
          balance: newBalance,
          updatedAt: new Date(),
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          accountId: id,
          amount: transactionAmount,
          direction: transactionDirection,
          type: transactionType,
          subType: 'BALANCE_ADJUSTMENT',
          description: description || `${type} money ${type === 'ADD' ? 'to' : 'from'} wallet`,
          referenceNumber: referenceNumber,
          commission: 0,
          netAmount: transactionAmount,
          status: 'COMPLETED',
        },
      });

      return {
        account: updatedAccount,
        transaction,
        previousBalance: account.balance,
        newBalance: updatedAccount.balance,
        adjustmentType: type,
        adjustedAmount: amount,
      };
    });
  }
}