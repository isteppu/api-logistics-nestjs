import { Module } from '@nestjs/common';
import { NotificationGateway } from './notifications.gateway.js';
import { NotificationService } from './notifications.service.js';

@Module({
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway], // Export both!
})

export class NotificationsModule {}
