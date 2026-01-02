// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';
import { DashboardQueryDto, DashboardResponseDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(
    query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    const [
      quickStats,
      monthlyRevenue,
      serviceStats,
      walletBalances,
      recentTransactions,
      serviceIncome,
    ] = await Promise.all([
      this.getQuickStats(query),
      this.getMonthlyRevenue(query),
      this.getServiceStats(query),
      this.getWalletBalances(),
      this.getRecentTransactions(query),
      this.getIncomeBreakdown(query),
    ]);

    return {
      quickStats,
      monthlyRevenue,
      serviceStats,
      walletBalances,
      recentTransactions,
      serviceIncome,
    };
  }

  async getQuickStats(query: DashboardQueryDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's collection (IN transactions)
    const todayTransactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        direction: 'IN',
        status: 'COMPLETED',
      },
    });

    const todaysCollection = todayTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );
    const todaysProfit = todayTransactions.reduce(
      (sum, t) => sum + t.profit,
      0,
    );

    // Total services today (bills created today)
    const todaysServices = await this.prisma.bill.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        billStatus: 'ACTIVE',
      },
    });

    // Money exchange today
    const moneyExchangeToday = await this.prisma.transaction.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        type: 'MONEY_EXCHANGE',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    return [
      {
        icon: 'solar:wallet-outline',
        label: "Today's Collection",
        value: `₹${todaysCollection.toLocaleString('en-IN')}`,
        percent: 12.5,
        color: '#3b82f6',
        chart: [12, 18, 14, 16, 12, 10, 14, 18, 16, 14, 12, 10],
      },
      {
        icon: 'solar:graph-outline',
        label: "Today's Profit",
        value: `₹${todaysProfit.toLocaleString('en-IN')}`,
        percent: 8.2,
        color: '#10b981',
        chart: [8, 12, 10, 14, 18, 16, 14, 12, 10, 14, 18, 16],
      },
      {
        icon: 'solar:checklist-outline',
        label: 'Total Services',
        value: todaysServices.toString(),
        percent: 15.3,
        color: '#f59e42',
        chart: [10, 14, 12, 16, 18, 14, 12, 10, 14, 18, 16, 12],
      },
      {
        icon: 'solar:users-outline',
        label: 'Money Exchange',
        value: `₹${Math.round((moneyExchangeToday._sum.amount || 0) / 1000)}K`,
        percent: 22.1,
        color: '#8b5cf6',
        chart: [16, 14, 12, 10, 14, 18, 16, 12, 10, 14, 18, 16],
      },
    ];
  }

  async getMonthlyRevenue(query: DashboardQueryDto) {
    const currentYear = new Date().getFullYear();
    const monthlyData: number[] = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const monthRevenue = await this.prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          direction: 'IN',
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      });

      monthlyData.push((monthRevenue._sum.amount as number) || 0);
    }

    return {
      series: [{ name: 'Revenue', data: monthlyData }],
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      percent: 15.44,
    };
  }

  async getServiceStats(query: DashboardQueryDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const serviceCounts = await this.prisma.billItem.groupBy({
      by: ['itemName'],
      where: {
        bill: {
          createdAt: { gte: today, lt: tomorrow },
        },
      },
      _count: { id: true },
    });

    const serviceColors: { [key: string]: string } = {
      'Biometric Withdrawal': '#3b82f6',
      'GPay Transactions': '#f59e42',
      'Xerox & Printing': '#10b981',
      'Online Services': '#8b5cf6',
    };

    return serviceCounts.map((service) => ({
      label: service.itemName,
      color: serviceColors[service.itemName] || '#6366f1',
      count: service._count.id,
    }));
  }

  async getWalletBalances() {
    const accounts = await this.prisma.account.findMany({
      where: { isActive: true },
      select: { id: true, name: true, balance: true, type: true },
    });

    return accounts.map((account) => ({
      name: account.name,
      balance: account.balance,
      type: account.type,
    }));
  }

  async getRecentTransactions(query: DashboardQueryDto) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        account: true,
        relatedAccount: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const transactionIcons: { [key: string]: string } = {
      BIO_METRIC_WITHDRAWAL: 'mdi:fingerprint',
      MONEY_EXCHANGE: 'mdi:currency-inr',
      SERVICE: 'mdi:file-document',
      PRODUCT_SALE: 'mdi:package-variant',
    };

    return transactions.map((tx) => {
      const subType = tx.subType || '';
      const transactionType = tx.type;

      return {
        icon:
          transactionIcons[subType] ||
          transactionIcons[transactionType] ||
          'mdi:cash',
        name: this.getTransactionDisplayName(tx),
        id: `#${tx.id.slice(-6).toUpperCase()}`,
        amount: tx.direction === 'IN' ? tx.amount : -tx.amount,
        time: tx.createdAt.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: tx.status.toLowerCase(),
        commission: tx.commission,
      };
    });
  }

  async getIncomeBreakdown(query: DashboardQueryDto) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const incomeByType = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        direction: 'IN',
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    const categoryMapping: { [key: string]: string } = {
      MONEY_EXCHANGE: 'Money Exchange',
      SERVICE: 'Printing',
      PRODUCT_SALE: 'Products',
      COMMISSION: 'Online Services',
      SELF_TRANSFER: 'Others',
    };

    const details = incomeByType.map((item) => ({
      label: categoryMapping[item.type] || 'Others',
      value: (item._sum.amount as number) || 0,
    }));

    const total = details.reduce((sum, item) => sum + item.value, 0);
    const series = details.map((item) =>
      Math.round((item.value / total) * 100),
    );
    const labels = details.map((item) => item.label);

    return {
      series,
      labels,
      details,
    };
  }

  private getTransactionDisplayName(transaction: any): string {
    const nameMap: { [key: string]: string } = {
      BIO_METRIC_WITHDRAWAL: 'Biometric Withdraw',
      CASH_TO_GPAY: 'Cash to GPay',
      GPAY_TO_CASH: 'GPay to Cash',
      ONLINE_BILL_PAYMENT: 'Online Bill Payment',
      MONEY_TRANSFER: 'Money Transfer',
    };

    return (
      nameMap[transaction.subType || ''] || transaction.type.replace('_', ' ')
    );
  }
}
