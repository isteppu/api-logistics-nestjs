import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SyncShipmentFinanceInput } from './dto/sync-shipment-finance.input.js';

@Injectable()
export class ShipmentFinanceService {
  constructor(private prisma: PrismaService) {}

  async syncFinance(input: SyncShipmentFinanceInput) {
    const { shipment_id, rows } = input;

    return this.prisma.$transaction(async (tx) => {
      // 1. Clear existing links and detailed records to avoid duplicates
      await tx.shipment_revenues.deleteMany({ where: { shipment_id } });
      await tx.shipment_expenses.deleteMany({ where: { shipment_id } });

      for (const row of rows) {
        // 2. Process Billing (Revenue)
        if (row.billing > 0) {
          const rev = await tx.shipment_revenue.create({
            data: { value: row.billing, revenue_map: row.title }
          });
          await tx.shipment_revenues.create({
            data: { shipment_id, revenues_id: rev.id }
          });
        }

        // 3. Process Cost (Expense)
        if (row.cost > 0) {
          const exp = await tx.shipment_expense.create({
            data: { value: row.cost, expense_map: row.title }
          });
          await tx.shipment_expenses.create({
            data: { shipment_id, expenses_id: exp.id }
          });
        }
      }
      return true;
    });
  }
}