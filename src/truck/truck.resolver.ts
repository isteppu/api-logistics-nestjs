import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TruckService } from './truck.service.js';
import { Truck } from './entities/truck.entity.js';
import { CreateTruckInput } from './dto/create-truck.input.js';
import { UpdateTruckInput } from './dto/update-truck.input.js';

@Resolver(() => Truck)
export class TruckResolver {
  constructor(private readonly truckService: TruckService) {}


}
