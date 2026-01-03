import { ConfigService } from '@nestjs/config';
export declare class OneSignalService {
    private configService;
    private readonly logger;
    private readonly appId;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    sendPushNotification(playerIds: string[], title: string, message: string, data?: Record<string, any>, imageUrl?: string): Promise<any>;
    sendNotificationToAllUsers(title: string, message: string, data?: Record<string, any>, imageUrl?: string): Promise<any>;
}
