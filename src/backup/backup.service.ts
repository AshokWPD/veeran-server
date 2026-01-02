import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/services/prisma.service';

@Injectable()
export class BackupService {
  constructor(private prisma: PrismaService) {}

  async fullDataExport() {
    const accounts = await this.prisma.account.findMany();
    const transactions = await this.prisma.transaction.findMany();
    const services = await this.prisma.service.findMany();
    const bills = await this.prisma.bill.findMany({
      include: { items: true, customer: true },
    });
    const customers = await this.prisma.customer.findMany();

    return {
      accounts,
      transactions,
      services,
      bills,
      customers,
    };
  }
}
