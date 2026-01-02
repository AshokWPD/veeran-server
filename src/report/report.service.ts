import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  // Total revenue, expenses, profit for a date range
  async financialSummary(startDate: Date, endDate: Date) {
    // Total income (sum of Transactions with direction IN)
    const incomeResults = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        direction: 'IN',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Total expenses (sum of Transactions with direction OUT)
    const expenseResults = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        direction: 'OUT',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const income = incomeResults._sum.amount || 0;
    const expenses = expenseResults._sum.amount || 0;
    const profit = income - expenses;

    return { income, expenses, profit };
  }

  // Top services by usage count
  async topServices(limit = 5) {
    const topServices = await this.prisma.billItem.groupBy({
      by: ['serviceId'],
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: limit,
      where: { serviceId: { not: null } },
    });
    return topServices;
  }

  // Account balances summary
  async accountBalances() {
    return this.prisma.account.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
