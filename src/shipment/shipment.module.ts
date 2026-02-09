import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service.js';
import { ShipmentResolver } from './shipment.resolver.js';
import { ShipmentFinanceService } from './shipment-finance.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [
    ShipmentResolver, 
    ShipmentService, 
    ShipmentFinanceService, // 2. Add it here!
    PrismaService
  ],
})
export class ShipmentModule {}
