import { OnModuleInit } from '@nestjs/common';
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
export declare class NotificationService implements OnModuleInit {
    private prisma;
    private oneSignalService;
    private imageGenerator;
    private eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, oneSignalService: OneSignalService, imageGenerator: ImageGeneratorService, eventEmitter: EventEmitter2);
    onModuleInit(): void;
    handleBillGenerated(event: BillGeneratedEvent): Promise<void>;
    sendCustomNotification(title: string, message: string, data?: Record<string, any>, imageUrl?: string): Promise<void>;
    getActiveAdminsCount(): Promise<number>;
    cleanupNotificationImages(): Promise<void>;
}
