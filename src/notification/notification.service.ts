import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../core/services/prisma.service';
import { OneSignalService } from '../core/services/onesignal.service';
import { ImageGeneratorService } from '../core/services/image-generator.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface BillGeneratedEvent {
  billId: string;
  billNumber: string;
  totalAmount: number;
  commission: number;
  customerName?: string;
  serviceType?: string;
  generatedBy: string;
  timestamp: Date;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private oneSignalService: OneSignalService,
    private imageGenerator: ImageGeneratorService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    // Listen for bill generation events
    this.eventEmitter.on('bill.generated', async (event: BillGeneratedEvent) => {
      await this.handleBillGenerated(event);
    });
  }

  async handleBillGenerated(event: BillGeneratedEvent) {
    try {
      this.logger.log(`Processing notification for bill: ${event.billNumber}`);

      // Get all admins with playerId
      const admins = await this.prisma.admin.findMany({
        where: {
          isActive: true,
          playerId: { not: null },
        },
        select: {
          playerId: true,
          name: true,
          email: true,
        },
      });

      const playerIds = admins.map(admin => admin.playerId).filter(Boolean);

      if (playerIds.length === 0) {
        this.logger.warn('No active admins with player IDs found');
        return;
      }

      // Generate notification image
      const imageUrl = await this.imageGenerator.generateNotificationImage(
        event.billNumber,
        event.totalAmount,
        event.commission,
        event.customerName,
        event.serviceType,
      );

      // Prepare notification data
      const title = `💰 பில் உருவாக்கப்பட்டது!`;
      const message = `பில் எண்: ${event.billNumber} | தொகை: ₹${event.totalAmount.toLocaleString('en-IN')}`;
      
      const notificationData = {
        billId: event.billId,
        billNumber: event.billNumber,
        type: 'BILL_GENERATED',
        amount: event.totalAmount,
        commission: event.commission,
        timestamp: event.timestamp.toISOString(),
        deepLink: `/bills/${event.billId}`,
      };

      // Send push notification
      await this.oneSignalService.sendPushNotification(
        playerIds as string[],
        title,
        message,
        notificationData,
        imageUrl,
      );

      this.logger.log(`Notification sent to ${playerIds.length} admins for bill ${event.billNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send notification for bill ${event.billNumber}:`, error);
    }
  }

  async sendCustomNotification(
    title: string,
    message: string,
    data?: Record<string, any>,
    imageUrl?: string,
  ) {
    try {
      const admins = await this.prisma.admin.findMany({
        where: {
          isActive: true,
          playerId: { not: null },
        },
        select: { playerId: true },
      });

      const playerIds = admins.map(admin => admin.playerId).filter(Boolean);

      if (playerIds.length === 0) {
        this.logger.warn('No active admins with player IDs found');
        return;
      }

      await this.oneSignalService.sendPushNotification(
        playerIds as string[],
        title,
        message,
        data,
        imageUrl,
      );

      this.logger.log(`Custom notification sent to ${playerIds.length} admins`);
    } catch (error) {
      this.logger.error('Failed to send custom notification:', error);
      throw error;
    }
  }

  async getActiveAdminsCount(): Promise<number> {
    return this.prisma.admin.count({
      where: {
        isActive: true,
        playerId: { not: null },
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupNotificationImages() {
    await this.imageGenerator.cleanupOldImages(24);
    this.logger.log('Cleaned up old notification images');
  }
}