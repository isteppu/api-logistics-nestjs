import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { ShipmentService } from './shipment.service.js';
import { Shipment, ShipmentResponse, ShipmentStorable } from './models/shipment.model.js';
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

  @Query(() => ShipmentResponse, { name: 'shipment' })
  search(@Args('input', { type: () => String }) query: string) {
    return this.shipmentService.search(query);
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
    if (revenues.length === 0 && expenses.length === 0) {
      return [];
    }

    const allRows: ShipmentFinanceRow[] = [];

    revenues.forEach(r => {
      if (r.shipment_revenue) {
        allRows.push({
          title: r.shipment_revenue.revenue_map || 'Revenue',
          type: r.shipment_revenue.type || 'amount',
          value: Number(r.shipment_revenue.value || 0)
        });
      }
    });

    expenses.forEach(e => {
      if (e.shipment_expense) {
        allRows.push({
          title: e.shipment_expense.expense_map || 'Expense',
          type: e.shipment_expense.type || 'amount',
          value: Number(e.shipment_expense.value || 0)
        });
      }
    });

    return allRows;
  }

  @ResolveField(() => [ShipmentStorable])
  async containers(@Parent() shipment: any) {
    const shipmentContainers = await this.prisma.shipment_container.findMany({
      where: { shipment_id: shipment.id },
      include: {
        storable: true
      }
    })

    if (shipmentContainers.length === 0) {
      return [];
    }

    const allRows: ShipmentStorable[] = [];

    shipmentContainers.forEach(r => {
      if (r.container_id) {
        allRows.push({
          id: r.container_id,
          type: r.storable.type,
          description: r.storable.description || "",
          date_created: r.storable.date_created,
          created_by: r.storable.created_by || ""
        });
      }
    });

    return allRows;
  }
}
