import { Module } from '@nestjs/common';
import { TruckService } from './truck.service.js';
import { TruckResolver } from './truck.resolver.js';

@Module({
  providers: [TruckResolver, TruckService],
})
export class TruckModule {}
