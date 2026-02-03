import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { StorableService } from './storable.service.js';
import { Storable } from './entities/storable.entity.js';
import { CreateStorableInput } from './dto/create-storable.input.js';
import { UpdateStorableInput } from './dto/update-storable.input.js';

@Resolver(() => Storable)
export class StorableResolver {
  constructor(private readonly storableService: StorableService) {}


}
