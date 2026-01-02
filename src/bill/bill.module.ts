import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { PrismaService } from '../core/services/prisma.service';
import { MoneyExchangeModule } from '../money-exchange/money-exchange.module'; // Add this import

@Module({
  imports: [MoneyExchangeModule], // Add this import
  controllers: [BillController],
  providers: [BillService, PrismaService],
  exports: [BillService],
})
export class BillModule {}

// import { Module } from '@nestjs/common';
// import { BillController } from './bill.controller';
// import { BillService } from './bill.service';

// @Module({
//   controllers: [BillController],
//   providers: [BillService]
// })
// export class BillModule {}
