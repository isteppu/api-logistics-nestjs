import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaTiDBCloud({ url: connectionString });
        super({ adapter }); 
    }
  async onModuleInit() {
    await this.$connect(); 
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}