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
import { NotificationModule } from './notification/notification.module';
import { MoneyExchangeModule } from './money-exchange/money-exchange.module';
import { ResponseLoggerMiddleware } from './common/middlewares/response-logger.middleware';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
     EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
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
        NotificationModule,

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
