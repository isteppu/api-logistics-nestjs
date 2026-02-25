import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DownloadService {
    constructor(private prisma: PrismaService) { }

    async getShipmentCsvData(dateFrom: string, dateTo: string) {
        const shipments = await this.prisma.shipment.findMany({
            where: {
                date_issued: {
                    gte: new Date(dateFrom),
                    lte: new Date(dateTo),
                },
            },
            orderBy: { date_issued: 'desc' }
        });

        const csvRows = await Promise.all(
            shipments.map(async (s) => {
                const [revenues, expenses] = await Promise.all([
                    this.prisma.shipment_revenues.findMany({
                        where: { shipment_id: s.id },
                        include: { shipment_revenue: true }
                    }),
                    this.prisma.shipment_expenses.findMany({
                        where: { shipment_id: s.id },
                        include: { shipment_expense: true }
                    })
                ]);

                const totalIncome = revenues.reduce((sum, r) =>
                    sum + Number(r.shipment_revenue?.value || 0), 0
                );

                const totalExpense = expenses.reduce((sum, e) =>
                    sum + Number(e.shipment_expense?.value || 0), 0
                );

                const net = totalIncome - totalExpense;

                return {
                    'Date Filed': s.date_issued.toISOString().split('T')[0],
                    'ID': s.id,
                    'BL No': s.blno,
                    'Income': totalIncome.toFixed(2),
                    'Expense': totalExpense.toFixed(2),
                    'Net': net.toFixed(2),
                };
            })
        );

        return csvRows;
    }

    async getTripCsvData(dateFrom: string, dateTo: string) {
        const trips = await this.prisma.trip.findMany({
            where: {
                date_created: {
                    gte: new Date(dateFrom),
                    lte: new Date(dateTo),
                },
            },
            orderBy: { date_created: 'desc' }
        });

        const csvRows = await Promise.all(
            trips.map(async (t) => {
                const [revenues, expenses] = await Promise.all([
                    this.prisma.trip_revenue.findMany({
                        where: { trip_id: t.id },
                    }),
                    this.prisma.trip_expense.findMany({
                        where: { trip_id: t.id },
                    })
                ]);

                const totalIncome = revenues.reduce((sum, r) =>
                    sum + Number(r.value || 0), 0
                );

                const totalExpense = expenses.reduce((sum, e) =>
                    sum + Number(e.value || 0), 0
                );

                const net = totalIncome - totalExpense;

                const expMap = expenses.reduce((acc, e) => {
                    if (!e.expense_map) return acc;

                    acc[e.expense_map] = (acc[e.expense_map] || 0) + Number(e.value);
                    return acc;
                }, {} as Record<string, number>);

                return {
                    'Date': t.date_created.toISOString().split('T')[0],
                    'Truck': t.truck_id,
                    'Port': t.port_id,
                    'Delivery Address': t.warehouse_id,
                    'Commodity': t.commodity,
                    'Volume': t.volumex ? t.volumex + ' x ' + t.volumey : "",
                    'Base Rate': t.base_rate,
                    'Tariff Rate': totalIncome.toFixed(2),
                    ...expMap,
                    'Sales': net.toFixed(2),
                };
            })
        );

        return csvRows;
    }

    convertToCsv(data: any[]) {
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row) =>
            Object.values(row).map(value => `"${value}"`).join(',')
        );
        return [headers, ...rows].join('\n');
    }
}
