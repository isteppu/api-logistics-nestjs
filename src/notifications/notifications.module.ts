import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';
import { NotificationService } from './notifications.service.js';

@Module({
  providers: [NotificationService, NotificationsGateway],
  exports: [NotificationService, NotificationsGateway], // Export both!
})

export class NotificationsModule {}
