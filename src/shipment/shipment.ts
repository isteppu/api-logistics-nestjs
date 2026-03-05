import { Injectable } from '@nestjs/common';
import { NotificationService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class Shipment {
  constructor(
    protected prisma: PrismaService,
    protected notificationService: NotificationService,
  ) { }

  async generateConsigneeReference(tx: any, consignee: string, customerId: string) {
    const currentYear = new Date().getFullYear();
    const constantConsignees = [
      "GOODSFIESTA",
      "NATURALGIVEN",
      "ELEGANT",
      "SHAWILL",
      "IVY"
    ];

    const isConstant = constantConsignees.includes(consignee);
    const firstLetter = isConstant ? consignee.charAt(0).toUpperCase() : "O";

    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    let count = 0;

    if (isConstant) {
      count = await tx.shipment.count({
        where: {
          customer_id: customerId,
          date_issued: { gte: yearStart, lt: yearEnd },
        },
      });
    } else {
      count = await tx.shipment.count({
        where: {
          user_shipment_customer_idTouser: {
            username: { notIn: constantConsignees }
          },
          date_issued: { gte: yearStart, lt: yearEnd },
        },
      });
    }

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${firstLetter}${sequence}`;
  }
}
