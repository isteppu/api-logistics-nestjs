import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { ShipmentService } from './shipment.service.js';
import { Shipment, ShipmentResponse } from './models/shipment.model.js';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { PaginationArgs } from './dto/shipment-pagination.args.js';
import { SyncShipmentFinanceInput } from './dto/sync-shipment-finance.input.js';
import { ShipmentFinanceRow } from './models/shipment-finance-row.model.js';
import { ShipmentFinanceService } from './shipment-finance.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Resolver(() => Shipment)
export class ShipmentResolver {
  constructor(
    private readonly shipmentService: ShipmentService,
    private financeService: ShipmentFinanceService,
    private prisma: PrismaService
  ) { }

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
  @ResolveField(() => [ShipmentFinanceRow])
  async financeSummary(@Parent() shipment: any) {
    // Collect separate DB records and group them by title for the UI "Row"
    const [revenues, expenses] = await Promise.all([
      this.prisma.shipment_revenues.findMany({
        where: { shipment_id: shipment.id },
        include: { shipment_revenue: true }
      }),
      this.prisma.shipment_expenses.findMany({
        where: { shipment_id: shipment.id },
        include: { shipment_expense: true }
      })
    ]);

    const summaryMap: Record<string, any> = {};

    revenues.forEach(r => {
      const title = r.shipment_revenue.revenue_map || 'General';
      if (!summaryMap[title]) summaryMap[title] = { title, billing: 0, cost: 0 };
      summaryMap[title].billing = r.shipment_revenue.value;
    });

    expenses.forEach(e => {
      const title = e.shipment_expense.expense_map || 'General';
      if (!summaryMap[title]) summaryMap[title] = { title, billing: 0, cost: 0 };
      summaryMap[title].cost = e.shipment_expense.value;
    });

    return Object.values(summaryMap);
  }
}
