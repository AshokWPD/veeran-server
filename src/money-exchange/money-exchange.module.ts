import { Module } from '@nestjs/common';
import { MoneyExchangeService } from './money-exchange.service';
import { PrismaService } from '../core/services/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
   imports: [EventEmitterModule.forRoot()],
  providers: [MoneyExchangeService, PrismaService],
  exports: [MoneyExchangeService], // This is crucial - export the service
})
export class MoneyExchangeModule {}