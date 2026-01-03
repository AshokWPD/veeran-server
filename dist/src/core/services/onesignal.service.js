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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OneSignalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneSignalService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let OneSignalService = OneSignalService_1 = class OneSignalService {
    configService;
    logger = new common_1.Logger(OneSignalService_1.name);
    appId;
    apiKey;
    baseUrl = 'https://onesignal.com/api/v1';
    constructor(configService) {
        this.configService = configService;
        const appId = this.configService.get('ONESIGNAL_APP_ID');
        const apiKey = this.configService.get('ONESIGNAL_API_KEY');
        if (!appId || !apiKey) {
            throw new Error('OneSignal configuration is missing. Please set ONESIGNAL_APP_ID and ONESIGNAL_API_KEY in your .env file');
        }
        this.appId = appId;
        this.apiKey = apiKey;
    }
    async sendPushNotification(playerIds, title, message, data, imageUrl) {
        try {
            if (!playerIds.length) {
                this.logger.warn('No player IDs provided for notification');
                return null;
            }
            const payload = {
                app_id: this.appId,
                include_player_ids: playerIds,
                headings: { en: title },
                contents: { en: message },
                data: data || {},
                big_picture: imageUrl,
                chrome_web_image: imageUrl,
                chrome_web_icon: this.configService.get('LOGO_URL', ''),
                chrome_icon: this.configService.get('LOGO_URL', ''),
                android_accent_color: this.configService.get('NOTIFICATION_ACCENT_COLOR', 'FF5722'),
                small_icon: this.configService.get('LOGO_URL', ''),
                large_icon: this.configService.get('LOGO_URL', ''),
            };
            const response = await axios_1.default.post(`${this.baseUrl}/notifications`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${this.apiKey}`,
                },
            });
            this.logger.log(`Notification sent successfully: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to send OneSignal notification:', error.response?.data || error.message);
            throw error;
        }
    }
    async sendNotificationToAllAdmins(title, message, data, imageUrl) {
        try {
            const payload = {
                app_id: this.appId,
                included_segments: ['Subscribed Users'],
                headings: { en: title },
                contents: { en: message },
                data: data || {},
                big_picture: imageUrl,
                chrome_web_image: imageUrl,
                chrome_web_icon: this.configService.get('LOGO_URL', ''),
                chrome_icon: this.configService.get('LOGO_URL', ''),
                android_accent_color: this.configService.get('NOTIFICATION_ACCENT_COLOR', 'FF5722'),
                small_icon: this.configService.get('LOGO_URL', ''),
                large_icon: this.configService.get('LOGO_URL', ''),
            };
            const response = await axios_1.default.post(`${this.baseUrl}/notifications`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${this.apiKey}`,
                },
            });
            this.logger.log(`Bulk notification sent successfully: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to send bulk notification:', error.response?.data || error.message);
            throw error;
        }
    }
};
exports.OneSignalService = OneSignalService;
exports.OneSignalService = OneSignalService = OneSignalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OneSignalService);
//# sourceMappingURL=onesignal.service.js.map