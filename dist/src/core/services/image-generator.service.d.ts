import { ConfigService } from '@nestjs/config';
export declare class ImageGeneratorService {
    private configService;
    private readonly logger;
    private readonly uploadPath;
    constructor(configService: ConfigService);
    private ensureDirectoryExists;
    generateNotificationImage(billNumber: string, amount: number, commission: number, customerName?: string, serviceType?: string): Promise<string>;
    private generateWithAlternativeMethod;
    private useHeadlessChromeDirectly;
    private getNotificationTemplate;
    private createFallbackUrl;
    cleanupOldImages(maxAgeHours?: number): Promise<void>;
}
