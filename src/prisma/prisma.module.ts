import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // This makes the module available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // This allows other modules to use the service
})
export class PrismaModule {}