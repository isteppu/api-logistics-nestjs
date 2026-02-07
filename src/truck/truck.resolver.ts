import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Truck, TruckPagination } from './models/truck.model.js';
import { TruckService } from './truck.service.js';
import { CreateTruckInput, UpdateTruckInput } from './dto/truck.input.js';

@Resolver(() => Truck)
export class TruckResolver {
  constructor(private readonly truckService: TruckService) {}

  @Query(() => TruckPagination)
  async trucks(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
    @Args('showArchived', { type: () => Boolean, defaultValue: false }) showArchived: boolean,
  ) {
    return this.truckService.findAll(skip, take, showArchived);
  }

  @Mutation(() => Truck)
  async createTruck(@Args('input') input: CreateTruckInput) {
    return this.truckService.create(input);
  }

  @Mutation(() => Truck)
  async updateTruck(@Args('input') input: UpdateTruckInput) {
    return this.truckService.update(input.id, input);
  }
}