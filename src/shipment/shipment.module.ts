import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { ShipmentService } from './shipment.service.js';
import { ShipmentResolver } from './shipment.resolver.js';
import { ShipmentFinanceService } from './shipment-finance.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Shipment } from './shipment.js';

@Module({
  imports: [
    NotificationsModule,
  ],
  providers: [
    ShipmentResolver, 
    ShipmentService, 
    ShipmentFinanceService, // 2. Add it here!
    PrismaService, Shipment
  ],
})
export class ShipmentModule {}
