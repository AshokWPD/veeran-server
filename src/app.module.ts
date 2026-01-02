import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AdminModule } from './admin/admin.module';
import { ServiceModule } from './service/service.module';
import { BillModule } from './bill/bill.module';
import { CustomerModule } from './customer/customer.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { ReportModule } from './report/report.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MoneyExchangeModule } from './money-exchange/money-exchange.module';
import { ResponseLoggerMiddleware } from './common/middlewares/response-logger.middleware';

@Module({
  imports: [
    CoreModule,
    AdminModule,
    ServiceModule,
    BillModule,
    CustomerModule,
    AccountModule,
    TransactionModule,
    ReportModule,
    DashboardModule,
    MoneyExchangeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply to all routes
    consumer.apply(ResponseLoggerMiddleware).forRoutes('*');
  }
}
