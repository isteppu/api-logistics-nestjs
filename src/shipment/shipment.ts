import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class Shipment {
     constructor(
        protected prisma: PrismaService,
        protected notificationService: NotificationService,
      ) { }

    generateConsigneeReference (consignee: string) {
        const consigneeCode = consignee.split('')[0];
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        return consigneeCode + randomDigits;
    }
}
