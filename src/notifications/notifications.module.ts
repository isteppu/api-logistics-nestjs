import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service.js';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})

export class NotificationsModule {}
