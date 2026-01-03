import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OneSignalService {
  private readonly logger = new Logger(OneSignalService.name);
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://onesignal.com/api/v1';

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('ONESIGNAL_APP_ID');
    const apiKey = this.configService.get<string>('ONESIGNAL_API_KEY');
    
    if (!appId || !apiKey) {
      throw new Error('OneSignal configuration is missing. Please set ONESIGNAL_APP_ID and ONESIGNAL_API_KEY in your .env file');
    }
    
    this.appId = appId;
    this.apiKey = apiKey;
  }

  async sendPushNotification(
    playerIds: string[],
    title: string,
    message: string,
    data?: Record<string, any>,
    imageUrl?: string,
  ) {
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

      const response = await axios.post(
        `${this.baseUrl}/notifications`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.apiKey}`,
          },
        },
      );

      this.logger.log(`Notification sent successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send OneSignal notification:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendNotificationToAllAdmins(title: string, message: string, data?: Record<string, any>, imageUrl?: string) {
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

      const response = await axios.post(
        `${this.baseUrl}/notifications`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${this.apiKey}`,
          },
        },
      );

      this.logger.log(`Bulk notification sent successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send bulk notification:', error.response?.data || error.message);
      throw error;
    }
  }
}