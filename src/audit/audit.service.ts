import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async getMonthlySales(year: number) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthlySales: Record<string, number> =
            Object.fromEntries(months.map(m => [m, 0]));

        const yearStart = new Date(`${year}-01-01`);
        const yearEnd = new Date(`${year + 1}-01-01`);

        const shipments = await this.prisma.shipment.findMany({
            where: {
                is_archived: 0,
                OR: [
                    { estimated_time_arrival: { gte: yearStart, lt: yearEnd } },
                ]
            },
            select: {
                id: true,
                estimated_time_arrival: true
            }
        });

        if (shipments.length > 0) {
            const shipmentIds = shipments.map(s => s.id);

            const [shipmentRevenues, shipmentExpenses] = await Promise.all([
                this.prisma.shipment_revenues.findMany({
                    where: { shipment_id: { in: shipmentIds } },
                    include: { shipment_revenue: true }
                }),
                this.prisma.shipment_expenses.findMany({
                    where: { shipment_id: { in: shipmentIds } },
                    include: { shipment_expense: true }
                })
            ]);

            const shipmentRevenueMap = new Map<string, number>();
            const shipmentExpenseMap = new Map<string, number>();

            shipmentRevenues.forEach(r => {
                const value = Number(r.shipment_revenue?.value || 0);
                shipmentRevenueMap.set(
                    r.shipment_id,
                    (shipmentRevenueMap.get(r.shipment_id) || 0) + value
                );
            });

            shipmentExpenses.forEach(e => {
                const value = Number(e.shipment_expense?.value || 0);
                shipmentExpenseMap.set(
                    e.shipment_id,
                    (shipmentExpenseMap.get(e.shipment_id) || 0) + value
                );
            });

            for (const shipment of shipments) {
                const date = shipment.estimated_time_arrival;
                if (!date) continue;

                const month = months[new Date(date).getMonth()];
                const revenue = shipmentRevenueMap.get(shipment.id) || 0;
                const expense = shipmentExpenseMap.get(shipment.id) || 0;

                monthlySales[month] += revenue - expense;
            }
        }

        const trips = await this.prisma.trip.findMany({
            where: {
                date_created: { gte: yearStart, lt: yearEnd }
            },
            select: {
                id: true,
                date_created: true
            }
        });

        if (trips.length > 0) {
            const tripIds = trips.map(t => t.id);

            const [tripRevenues, tripExpenses] = await Promise.all([
                this.prisma.trip_revenue.findMany({
                    where: { trip_id: { in: tripIds } }
                }),
                this.prisma.trip_expense.findMany({
                    where: { trip_id: { in: tripIds } }
                })
            ]);

            const tripRevenueMap = new Map<string, number>();
            const tripExpenseMap = new Map<string, number>();

            tripRevenues.forEach(r => {
                tripRevenueMap.set(
                    r.trip_id,
                    (tripRevenueMap.get(r.trip_id) || 0) + Number(r.value || 0)
                );
            });

            tripExpenses.forEach(e => {
                tripExpenseMap.set(
                    e.trip_id,
                    (tripExpenseMap.get(e.trip_id) || 0) + Number(e.value || 0)
                );
            });

            for (const trip of trips) {
                const month = months[new Date(trip.date_created).getMonth()];
                const revenue = tripRevenueMap.get(trip.id) || 0;
                const expense = tripExpenseMap.get(trip.id) || 0;

                monthlySales[month] += revenue - expense;
            }
        }

        return monthlySales;
    }
}
