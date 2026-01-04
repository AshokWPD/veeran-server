import { Injectable, Logger } from '@nestjs/common';
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

      this.logger.log(`Sending notification to ${playerIds.length} players`);
      this.logger.log(`Image URL for notification: ${imageUrl}`);

      // IMPORTANT: For OneSignal, you need to use specific fields for images
      const payload: any = {
        app_id: this.appId,
        include_player_ids: playerIds,
        headings: { en: title },
        contents: { en: message },
        data: data || {},
        // For iOS
        ios_attachments: imageUrl ? { id1: imageUrl } : undefined,
        // For Android
        large_icon: this.configService.get('LOGO_URL', ''),
        android_led_color: 'FF5722FF',
        android_accent_color: 'FF5722',
        // IMPORTANT: Use big_picture for Android notifications
        big_picture: imageUrl,
        // global_image: imageUrl,
        // For Chrome/Web
        chrome_web_image: imageUrl,
        // For all platforms
        adm_big_picture: imageUrl, // For Amazon devices
        chrome_big_picture: imageUrl, // For Chrome
      };

      // If image is provided, add it to the notification
      if (imageUrl) {
        // OneSignal needs the image to be publicly accessible
        payload.ios_attachments = { image: imageUrl };
        payload.big_picture = imageUrl;
        payload.chrome_web_image = imageUrl;
        payload.firefox_icon = imageUrl;
        payload.chrome_icon = imageUrl;
      }

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

      this.logger.log(`Notification sent successfully. ID: ${response.data.id}`);
      this.logger.log(`Notification recipients: ${response.data.recipients}`);
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send OneSignal notification:', error.response?.data || error.message);
      if (error.response) {
        this.logger.error('OneSignal API Error Details:', error.response.data);
      }
      throw error;
    }
  }

  // For sending to all users (if needed)
  async sendNotificationToAllUsers(
    title: string,
    message: string,
    data?: Record<string, any>,
    imageUrl?: string,
  ) {
    try {
      const payload: any = {
        app_id: this.appId,
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        data: data || {},
        big_picture: imageUrl,
        chrome_web_image: imageUrl,
        large_icon: this.configService.get('LOGO_URL', ''),
        android_accent_color: 'FF5722',
      };

      if (imageUrl) {
        payload.ios_attachments = { image: imageUrl };
        payload.big_picture = imageUrl;
      }

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

      this.logger.log(`Bulk notification sent. ID: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send bulk notification:', error.response?.data || error.message);
      throw error;
    }
  }
}