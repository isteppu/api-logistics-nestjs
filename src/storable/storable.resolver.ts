import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Storable } from './models/storable.model.js';
import { StorableService } from './storable.service.js';
import { CreateStorableInput } from './dto/create-storable.input.js';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js'; 
import { CurrentUser } from '../auth/current-user.decorator.js';

@Resolver(() => Storable)
export class StorableResolver {
  constructor(private readonly storableService: StorableService) {}

  @Query(() => [Storable])
  async storablesByType(@Args('type') type: string) {
    return this.storableService.findAllByType(type);
  }

  @Mutation(() => Storable)
  @UseGuards(AuthGuard)
  async createStorable(
    @Args('input') input: CreateStorableInput,
    @CurrentUser() user: any,
  ) {
    return this.storableService.create(input, user.id);
  }
}