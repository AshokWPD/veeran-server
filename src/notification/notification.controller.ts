import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-custom')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send custom notification to all admins' })
  async sendCustomNotification(
    @Body() body: { title: string; message: string; data?: Record<string, any>; imageUrl?: string },
  ) {
    return this.notificationService.sendCustomNotification(
      body.title,
      body.message,
      body.data,
      body.imageUrl,
    );
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get notification statistics' })
  async getStats() {
    const activeAdmins = await this.notificationService.getActiveAdminsCount();
    return {
      activeAdminsWithPlayerId: activeAdmins,
      message: `${activeAdmins} admins can receive notifications`,
    };
  }
}