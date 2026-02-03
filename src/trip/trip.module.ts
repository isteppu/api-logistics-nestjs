import { Module } from '@nestjs/common';
import { TripService } from './trip.service.js';
import { TripResolver } from './trip.resolver.js';

@Module({
  providers: [TripResolver, TripService],
})
export class TripModule {}
