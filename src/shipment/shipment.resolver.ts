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
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.shipmentService.findOne(id);
  }

  @Mutation(() => Shipment)
  removeShipment(@Args('id', { type: () => Int }) id: number) {
    return this.shipmentService.remove(id);
  }

  @Mutation(() => Boolean)
  async syncShipmentFinance(
    @Args('input') input: SyncShipmentFinanceInput,
  ) {
    return this.financeService.syncFinance(input);
  }

  @ResolveField(() => [ShipmentFinanceRow])
  async financeSummary(@Parent() shipment: any) {
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

    // If both are empty, return an empty array immediately 
    // to avoid returning null to a non-nullable field.
    if (revenues.length === 0 && expenses.length === 0) {
      return [];
    }

    const allRows: ShipmentFinanceRow[] = [];

    revenues.forEach(r => {
      if (r.shipment_revenue) {
        allRows.push({
          // Fallback to "Revenue" if revenue_map is null
          title: r.shipment_revenue.revenue_map || 'Revenue',
          type: r.shipment_revenue.type || 'amount',
          value: Number(r.shipment_revenue.value || 0)
        });
      }
    });

    expenses.forEach(e => {
      if (e.shipment_expense) {
        allRows.push({
          // Fallback to "Expense" if expense_map is null
          title: e.shipment_expense.expense_map || 'Expense',
          type: e.shipment_expense.type || 'amount',
          value: Number(e.shipment_expense.value || 0)
        });
      }
    });

    return allRows;
  }
}
