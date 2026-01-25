import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service.js';
import { ShipmentResolver } from './shipment.resolver.js';

@Module({
  providers: [ShipmentResolver, ShipmentService],
})
export class ShipmentModule {}
