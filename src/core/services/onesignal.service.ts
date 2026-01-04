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
      
      // Format image URL - add https:// if not present
      let formattedImageUrl = this.formatImageUrl(imageUrl);
      
      if (formattedImageUrl) {
        this.logger.log(`Formatted Image URL: ${formattedImageUrl}`);
      }

      // Build payload
      const payload: any = {
        app_id: this.appId,
        include_player_ids: playerIds,
        headings: { en: title },
        contents: { en: message },
        data: data || {},
        large_icon: 'https://dev.goltens.in/uploads/icon.png',
        android_accent_color: 'FF5722',
        android_led_color: 'FF5722FF',
        android_sound: 'notification',
        ios_sound: 'notification.wav',
      };

      // Add image fields ONLY if formattedImageUrl is provided
      if (formattedImageUrl) {
        payload.large_picture = formattedImageUrl;  // Global image
        payload.big_picture = formattedImageUrl;    // Android big picture
        payload.chrome_web_image = formattedImageUrl; // Web
        payload.chrome_big_picture = formattedImageUrl; // Chrome
        payload.ios_attachments = { id1: formattedImageUrl }; // iOS
        payload.mutable_content = 1; // Enable for iOS rich notifications
      }

      this.logger.log('Sending OneSignal payload:', JSON.stringify(payload, null, 2));

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
        this.logger.error('OneSignal API Error Details:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  // Helper method to format image URL
  private formatImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) return undefined;
    
    // If already has http:// or https://, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Add https:// to the beginning
    // Remove any leading slashes to avoid double slashes
    const cleanUrl = imageUrl.replace(/^\/+/, '');
    return `https://${cleanUrl}`;
  }

  // Specific method for bill notifications
  async sendBillNotification(
    playerIds: string[],
    billId: string,
    billNumber: string,
    amount: number,
    commission: number,
    imageUrl?: string, // Can be full URL or just domain path
  ) {
    const title = '💰 லாபம் பெற்றுள்ளீர்கள்!';
    const message = `லாபம்: ₹${commission.toLocaleString()}`;
    
    const data = {
      billId,
      billNumber,
      type: 'BILL_GENERATED',
      amount,
      commission,
      timestamp: new Date().toISOString(),
      deepLink: `/bills/${billId}`
    };

    // The imageUrl will be formatted automatically in sendPushNotification
    return this.sendPushNotification(
      playerIds,
      title,
      message,
      data,
      imageUrl
    );
  }

  // For sending to all users
  async sendNotificationToAllUsers(
    title: string,
    message: string,
    data?: Record<string, any>,
    imageUrl?: string,
  ) {
    try {
      // Format image URL
      const formattedImageUrl = this.formatImageUrl(imageUrl);
      
      const payload: any = {
        app_id: this.appId,
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        data: data || {},
        large_icon: 'https://dev.goltens.in/uploads/icon.png',
        android_accent_color: 'FF5722',
      };

      // Add image if provided
      if (formattedImageUrl) {
        payload.large_picture = formattedImageUrl;
        payload.big_picture = formattedImageUrl;
        payload.ios_attachments = { id1: formattedImageUrl };
        payload.chrome_web_image = formattedImageUrl;
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

  // Test method to verify URL formatting
  async testNotificationWithUrlFormatting(
    playerId: string,
    imageUrl: string
  ) {
    const formattedUrl = this.formatImageUrl(imageUrl);
    this.logger.log(`Original URL: ${imageUrl}`);
    this.logger.log(`Formatted URL: ${formattedUrl}`);
    
    return this.sendPushNotification(
      [playerId],
      'URL Format Test',
      'Testing URL formatting',
      { originalUrl: imageUrl, formattedUrl },
      imageUrl
    );
  }
}