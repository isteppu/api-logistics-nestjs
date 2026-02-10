import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SyncShipmentFinanceInput } from './dto/sync-shipment-finance.input.js';

@Injectable()
export class ShipmentFinanceService {
  constructor(private prisma: PrismaService) {}

  async syncFinance(input: SyncShipmentFinanceInput) {
    const { shipment_id, rows } = input;
  
    return this.prisma.$transaction(async (tx) => {
      await tx.shipment_revenues.deleteMany({ where: { shipment_id } });
      await tx.shipment_expenses.deleteMany({ where: { shipment_id } });
  
      for (const row of rows) {
        const isRevenue = row.title.toLowerCase().includes('billing');
  
        if (isRevenue) {
          // 1. Ensure the category title exists in 'revenue' table
          await tx.revenue.upsert({
            where: { title: row.title },
            update: {},
            create: { title: row.title },
          });
  
          const rev = await tx.shipment_revenue.create({
            data: { value: row.value, revenue_map: row.title, type: row.type }
          });
          await tx.shipment_revenues.create({
            data: { shipment_id, revenues_id: rev.id }
          });
        } else {
          await tx.expense.upsert({
            where: { title: row.title },
            update: {},
            create: { title: row.title },
          });
  
          const exp = await tx.shipment_expense.create({
            data: { value: row.value, expense_map: row.title, type: row.type }
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