import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('telegram-webhook')
  async handleUpdate(@Body() update: any) {
    if (update.callback_query) {
      const callback = update.callback_query;
      const message = callback.message;
      const username = callback.from.username || callback.from.first_name;
      const callbackData = callback.data;

      if (callbackData.startsWith('read_')) {
        await this.notificationService.markAsRead(message.message_id, username);
      }
    }
    return { ok: true };
  }

  @Get()
  async getUserNotifications(@Query('username') username: string) {
    return this.notificationService.getNotificationsByUser(username);
  }
}