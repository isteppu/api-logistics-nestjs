import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { TripPaginationResponse, Trip } from './models/trip.model.js'; // You'll need to create this model!
import { TripService } from './trip.service.js';
import { CreateTripInput } from './dto/create-trip.input.js';
import { UpdateTripInput } from './dto/update-trip.input.js';
import { Storable } from '../storable/models/storable.model.js';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @Query(() => TripPaginationResponse)
  async trips(
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 10 }) take: number,
  ) {
    return this.tripService.findAllPaginated(skip, take);
  }

  @Mutation(() => Trip)
  async createTrip(@Args('input') input: CreateTripInput) {
    return this.tripService.create(input);
  }

  @Mutation(() => Trip)
  async updateTrip(@Args('input') input: UpdateTripInput) {
    return this.tripService.update(input.id, input);
  }

  @ResolveField(() => Storable, { nullable: true })
  port(@Parent() trip: any) {
    return trip.storable_trip_port_idTostorable;
  }

  @ResolveField(() => Storable, { nullable: true })
  container(@Parent() trip: any) {
    return trip.storable_trip_container_idTostorable;
  }
}