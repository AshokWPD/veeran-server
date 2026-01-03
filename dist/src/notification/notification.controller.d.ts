import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    sendCustomNotification(body: {
        title: string;
        message: string;
        data?: Record<string, any>;
        imageUrl?: string;
    }): Promise<void>;
    getStats(): Promise<{
        activeAdminsWithPlayerId: number;
        message: string;
    }>;
}
