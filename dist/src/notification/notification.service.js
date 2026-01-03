"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../core/services/prisma.service");
const onesignal_service_1 = require("../core/services/onesignal.service");
const image_generator_service_1 = require("../core/services/image-generator.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    oneSignalService;
    imageGenerator;
    eventEmitter;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(prisma, oneSignalService, imageGenerator, eventEmitter) {
        this.prisma = prisma;
        this.oneSignalService = oneSignalService;
        this.imageGenerator = imageGenerator;
        this.eventEmitter = eventEmitter;
    }
    onModuleInit() {
        this.eventEmitter.on('bill.generated', async (event) => {
            await this.handleBillGenerated(event);
        });
    }
    async handleBillGenerated(event) {
        try {
            this.logger.log(`Processing notification for bill: ${event.billNumber}`);
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
            const imageUrl = await this.imageGenerator.generateNotificationImage(event.billNumber, event.totalAmount, event.commission, event.customerName, event.serviceType);
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
            await this.oneSignalService.sendPushNotification(playerIds, title, message, notificationData, imageUrl);
            this.logger.log(`Notification sent to ${playerIds.length} admins for bill ${event.billNumber}`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification for bill ${event.billNumber}:`, error);
        }
    }
    async sendCustomNotification(title, message, data, imageUrl) {
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
            await this.oneSignalService.sendPushNotification(playerIds, title, message, data, imageUrl);
            this.logger.log(`Custom notification sent to ${playerIds.length} admins`);
        }
        catch (error) {
            this.logger.error('Failed to send custom notification:', error);
            throw error;
        }
    }
    async getActiveAdminsCount() {
        return this.prisma.admin.count({
            where: {
                isActive: true,
                playerId: { not: null },
            },
        });
    }
    async cleanupNotificationImages() {
        await this.imageGenerator.cleanupOldImages(24);
        this.logger.log('Cleaned up old notification images');
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "cleanupNotificationImages", null);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        onesignal_service_1.OneSignalService,
        image_generator_service_1.ImageGeneratorService,
        event_emitter_1.EventEmitter2])
], NotificationService);
//# sourceMappingURL=notification.service.js.map