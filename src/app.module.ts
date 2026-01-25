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

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), 
      playground: true,
      resolvers: { DateTime: GraphQLISODateTime }
    }),
    AuthModule, 
    PrismaModule, ShipmentModule, UserModule
  ],
  controllers: [AppController],
  providers: [AppService, UserService, UserResolver],
})
export class AppModule {}
