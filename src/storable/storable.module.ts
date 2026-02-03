import { Module } from '@nestjs/common';
import { StorableService } from './storable.service.js';
import { StorableResolver } from './storable.resolver.js';

@Module({
  providers: [StorableResolver, StorableService],
})
export class StorableModule {}
