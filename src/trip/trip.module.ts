import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { TripService } from './trip.service.js';
import { TripResolver } from './trip.resolver.js';

@Module({
  imports: [
    NotificationsModule,
  ],
  providers: [TripResolver, TripService],
})
export class TripModule {}
