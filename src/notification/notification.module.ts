import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { CoreModule } from '../core/core.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CoreModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}