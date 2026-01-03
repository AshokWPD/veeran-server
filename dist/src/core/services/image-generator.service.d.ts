import { ConfigService } from '@nestjs/config';
export declare class ImageGeneratorService {
    private configService;
    private readonly logger;
    private readonly uploadPath;
    private readonly platform;
    constructor(configService: ConfigService);
    private ensureDirectoryExists;
    private getPuppeteerConfig;
    generateNotificationImage(billNumber: string, amount: number, commission: number, customerName?: string, serviceType?: string): Promise<string>;
    private generateImageForWindows;
    private generateImageForLinux;
    private getNotificationTemplate;
    cleanupOldImages(maxAgeHours?: number): Promise<void>;
}
