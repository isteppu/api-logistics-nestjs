import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { TripPaginationResponse, Trip } from './models/trip.model.js'; // You'll need to create this model!
import { TripService } from './trip.service.js';
import { CreateTripInput } from './dto/create-trip.input.js';
import { UpdateTripInput } from './dto/update-trip.input.js';
import { Storable } from '../storable/models/storable.model.js';
import { ShipmentFinanceRow } from '../shipment/models/shipment-finance-row.model.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService, private prisma: PrismaService) { }

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

  @ResolveField(() => Storable, { nullable: true })
  warehouse(@Parent() trip: any) {
    return trip.storable_trip_warehouse_idTostorable;
  }

  @ResolveField(() => [ShipmentFinanceRow])
  async financeSummary(@Parent() trip: any) {
    const [revenues, expenses] = await Promise.all([
      this.prisma.trip_revenue.findMany({ where: { trip_id: trip.id } }),
      this.prisma.trip_expense.findMany({ where: { trip_id: trip.id } })
    ]);

    const allRows = [
      ...revenues.map(r => ({
        title: r.revenue_map || 'Revenue',
        type: r.type || 'amount',
        value: Number(r.value)
      })),
      ...expenses.map(e => ({
        title: e.expense_map || 'Expense',
        type: e.type || 'amount',
        value: Number(e.value)
      }))
    ];

    return allRows;
  }
}