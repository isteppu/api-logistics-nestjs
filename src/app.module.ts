import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLISODateTime, GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ShipmentModule } from './shipment/shipment.module.js';
import { UserService } from './user/user.service.js';
import { UserResolver } from './user/user.resolver.js';
import { UserModule } from './user/user.module.js';
import { ExpenseModule } from './expense/expense.module.js';
import { TripModule } from './trip/trip.module.js';
import { StorableModule } from './storable/storable.module.js';
import { TruckModule } from './truck/truck.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { NotificationsController } from './notifications/notifications.controller.js';
import { NotificationService } from './notifications/notifications.service.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), 
      playground: true,
      resolvers: { DateTime: GraphQLISODateTime }
    }),
    AuthModule, 
    PrismaModule, ShipmentModule, UserModule, ExpenseModule, TripModule, StorableModule, TruckModule, DashboardModule, NotificationsModule
  ],
  controllers: [AppController, NotificationsController],
  providers: [AppService, UserService, UserResolver, NotificationService],
})
export class AppModule {}
