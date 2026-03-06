import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DownloadService {
    constructor(private prisma: PrismaService) { }

    async getCustomerUsername(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                username: true
            }
        })

        return user?.username
    }

    async getShipmentCsvData(dateFrom: string, dateTo: string, consignee: string) {
        const shipments = await this.prisma.shipment.findMany({
            where: {
                estimated_time_arrival: {
                    gte: new Date(dateFrom),
                    lte: new Date(dateTo),
                },
                customer_id: consignee
            },
            orderBy: { estimated_time_arrival: 'desc' }
        });

        const csvRows = await Promise.all(
            shipments.map(async (s) => {

                const [revenues, expenses, containers, warehouses] = await Promise.all([
                    this.prisma.shipment_revenues.findMany({
                        where: { shipment_id: s.id },
                        include: { shipment_revenue: true }
                    }),
                    this.prisma.shipment_expenses.findMany({
                        where: { shipment_id: s.id },
                        include: { shipment_expense: true }
                    }),
                    this.prisma.shipment_container.findMany({
                        where: {
                            shipment_id: s.id
                        },
                        select: {
                            container_id: true,
                        }
                    }),
                    this.prisma.shipment_container.findMany({
                        where: {
                            shipment_id: s.id
                        },
                        select: {
                            warehouse_id: true,
                        }
                    })
                ]);

                const totalIncome = revenues.reduce((sum, r) =>
                    sum + Number(r.shipment_revenue?.value || 0), 0
                );

                const totalExpense = expenses
                    .filter(e => e.shipment_expense?.expense_map?.toLowerCase() !== 'trucking (vat)')
                    .reduce((sum, e) =>
                        sum + Number(e.shipment_expense?.value || 0), 0
                    );

                const expMap = expenses.reduce((acc, e) => {
                    if (!e.shipment_expense) return acc;


                    acc[e.shipment_expense?.expense_map!] = (acc[e.shipment_expense?.expense_map!] || 0) + Number(e.shipment_expense?.value);
                    return acc;
                }, {} as Record<string, number>);

                const net = totalIncome - totalExpense;
                return {
                    'Selectivity': s.selectivity,
                    'REF': s.reference,
                    'BL No': s.blno,
                    'Volume': s.volumex + 'x' + s.volumey,
                    'Ship. Line': s.shipping_line,
                    'Port': s.port_id,
                    'ATA': s.actual_time_arrival,
                    'Entry No': s.entry_no,
                    'Registry No.': s.registry_no,
                    'Containers': containers.join(', '),
                    'Warehouse': warehouses.join(', '),
                    '': '',
                    'Billing': totalIncome.toFixed(2),
                    ...expMap,
                    'Net': net.toFixed(2),
                };
            })
        );

        return csvRows;
    }

    async getYearlyTripLedger(year: number) {
        const months = Array.from({ length: 12 }, (_, i) => i);
        const finalMatrix: string[][] = [];

        finalMatrix.push([
            'Date', 'Truck', 'Port', 'Delivery Address', 'Commodity', 'Volume', 'Cntr No.',
            'Base Rate', '', 'Tariff Rate', 'P/R Expense', 'Drvr Comm', 'Hlpr Comm',
            'Other Exp', 'RFID', 'Sales', 'Margin %'
        ]);

        for (const monthIdx of months) {
            const startDate = new Date(year, monthIdx, 1);
            const endDate = new Date(year, monthIdx + 1, 0, 23, 59, 59);
            const monthName = startDate.toLocaleString('default', { month: 'long' }).toUpperCase();

            // Month Header Row
            finalMatrix.push(Array(17).fill(''));
            finalMatrix.push(['', '', '', '', '', '', '', '', monthName, '', '', '', '', monthName, '', '', '']);
            finalMatrix.push(Array(17).fill(''));

            const trips = await this.prisma.trip.findMany({
                where: { date_created: { gte: startDate, lte: endDate } },
                include: {
                    truck: true,
                    storable_trip_port_idTostorable: true,
                    storable_trip_container_idTostorable: true
                },
                orderBy: { date_created: 'asc' }
            });

            const monthSummaryData: Record<string, any> = {};

            // 1. Process Individual Trip Rows
            for (const t of trips) {
                const [revenues, expenses] = await Promise.all([
                    this.prisma.trip_revenue.findMany({ where: { trip_id: t.id } }),
                    this.prisma.trip_expense.findMany({ where: { trip_id: t.id } })
                ]);

                const fin = this.mapFinances(revenues, expenses);
                const netSales = fin.tariffRate - fin.totalExp;
                const margin = fin.tariffRate > 0 ? Math.round((netSales / fin.tariffRate) * 100) : 0;

                // Trip Row
                finalMatrix.push([
                    t.date_created.toISOString().split('T')[0],
                    t.truck_id || '',
                    t.port_id || '',
                    t.warehouse_id || '',
                    t.commodity || '',
                    `${t.volumex || 1}x${t.volumey || 40}`,
                    t.container_id || '',
                    t.base_rate?.toFixed(2) || '',
                    '',
                    fin.tariffRate.toFixed(2),
                    fin.prExp.toFixed(2),
                    fin.drvrComm.toFixed(2),
                    fin.hlprComm.toFixed(2),
                    fin.otherExp.toFixed(2),
                    fin.rfid.toFixed(2),
                    netSales.toFixed(2),
                    `${margin}%`
                ]);

                if (!monthSummaryData[t.truck_id!]) {
                    monthSummaryData[t.truck_id!] = { gross: 0, salaries: 0, tripExp: 0, rfid: 0, net: 0 };
                }
                monthSummaryData[t.truck_id!].gross += fin.tariffRate;
                monthSummaryData[t.truck_id!].salaries += (fin.drvrComm + fin.hlprComm);
                monthSummaryData[t.truck_id!].tripExp += (fin.prExp + fin.otherExp);
                monthSummaryData[t.truck_id!].rfid += fin.rfid;
                monthSummaryData[t.truck_id!].net += netSales;
            }

            finalMatrix.push(Array(17).fill(''));
            finalMatrix.push(['', '', '', '', `${monthName} SUMMARY`, '', '', '', '', '', '', '', '', '', '', '', '']);
            finalMatrix.push(Array(17).fill(''));
            finalMatrix.push(['', '', '', '', 'Unit', 'Gross Sales', 'Salaries', 'Trip Exp', 'RFID', 'Net Sales', 'Profit Margin']);

            let mGross = 0, mSalaries = 0, mTripExp = 0, mRFID = 0, mNet = 0;

            Object.keys(monthSummaryData).forEach(truckId => {
                const d = monthSummaryData[truckId];
                const mgn = d.gross > 0 ? Math.round((d.net / d.gross) * 100) : 0;
                finalMatrix.push([
                    '', '', '', '', truckId, d.gross.toFixed(2), d.salaries.toFixed(2),
                    d.tripExp.toFixed(2), d.rfid.toFixed(2), d.net.toFixed(2), `${mgn}%`
                ]);
                mGross += d.gross; mSalaries += d.salaries; mTripExp += d.tripExp; mRFID += d.rfid; mNet += d.net;
            });

            const mTotalMargin = mGross > 0 ? Math.round((mNet / mGross) * 100) : 0;
            finalMatrix.push(['', '', '', '', 'TOTAL:', mGross.toFixed(2), mSalaries.toFixed(2), mTripExp.toFixed(2), mRFID.toFixed(2), mNet.toFixed(2), `${mTotalMargin}%`]);
        }

        return finalMatrix;
    }

    private mapFinances(revs: any[], exps: any[]) {
        const findRev = (m: string) => Number(revs.find(r => r.revenue_map?.toLowerCase() === m.toLowerCase())?.value || 0);
        const findExp = (m: string) => Number(exps.find(e => e.expense_map?.toLowerCase() === m.toLowerCase())?.value || 0);

        const data = {
            baseRate: findRev('Base Rate'),
            tariffRate: findRev('Tariff Rate'),
            prExp: findExp('P/R Expense'),
            drvrComm: findExp('Drvr Comm'),
            hlprComm: findExp('Hlpr Comm'),
            otherExp: findExp('Other Exp'),
            rfid: findExp('RFID'),
        };
        return { ...data, totalExp: data.prExp + data.drvrComm + data.hlprComm + data.otherExp + data.rfid };
    }

    formatMatrixToCsv(rows: string[][]) {
        return rows.map(r => r.map(cell => `"${cell || ''}"`).join(',')).join('\n');
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
