import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { ShipmentService } from './shipment.service.js';
import { Shipment, ShipmentResponse } from './models/shipment.model.js';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { PaginationArgs } from './dto/shipment-pagination.args.js';
import { SyncShipmentFinanceInput } from './dto/sync-shipment-finance.input.js';
import { ShipmentFinanceRow } from './models/shipment-finance-row.model.js';

@Resolver(() => Shipment)
export class ShipmentResolver {
  constructor(private readonly shipmentService: ShipmentService) { }

  @Mutation(() => Shipment)
  createShipment(@Args('input') createShipmentInput: CreateShipmentInput) {
    return this.shipmentService.create(createShipmentInput);
  }

  @Mutation(() => Shipment)
  async updateShipment(@Args('input') input: UpdateShipmentInput) {
    return this.shipmentService.update(input.id, input);
  }

  @Query(() => ShipmentResponse, { name: 'shipments' })
  async getShipments(@Args() { skip, take }: PaginationArgs) {
    return this.shipmentService.findAll(skip, take);
  }

  @Query(() => Shipment, { name: 'shipment' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.shipmentService.findOne(id);
  }

  @Mutation(() => Shipment)
  removeShipment(@Args('id', { type: () => Int }) id: number) {
    return this.shipmentService.remove(id);
  }
}
