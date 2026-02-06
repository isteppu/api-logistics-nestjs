import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Storable, StorablePagination } from './models/storable.model.js';
import { StorableService } from './storable.service.js';
import { CreateStorableInput } from './dto/create-storable.input.js';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Resolver(() => Storable)
export class StorableResolver {
  constructor(private readonly storableService: StorableService) { }

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
    return this.storableService.create(input, user);
  }

  @Query(() => StorablePagination)
  async storables(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
    @Args('type', { type: () => String, nullable: true }) type?: string,
  ) {
    return this.storableService.findAll(skip, take, type);
  }
}