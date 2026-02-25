import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { startOfYear, format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalPending, totalTransit, totalDelivered, totalTrucks] = await Promise.all([
            this.prisma.shipment.count({
                where: { status: 'PENDING' },
            }),

            this.prisma.trip.count({
                where: { date_delivered: null },
            }),

            this.prisma.trip.count({
                where: { NOT: { date_delivered: null } },
            }),

            this.prisma.truck.count({
                where: { NOT: { is_archived: 1 } },
            })
        ]);

        return {
            'TotalPending': totalPending,
            'TotalTransit': totalTransit,
            'TotalDelivered': totalDelivered,
            'TotalTrucks': totalTrucks
        };
    }

    async getMonthlyAnalytics() {
        const now = new Date();
        const yearStart = startOfYear(now);

        const [shipments, trips] = await Promise.all([
            this.prisma.shipment.findMany({
                where: {
                    date_issued: { gte: yearStart },
                },
                select: { date_issued: true },
            }),
            this.prisma.trip.findMany({
                where: {
                    date_delivered: { gte: yearStart },
                },
                select: { date_delivered: true },
            }),
        ]);

        const monthsInterval = eachMonthOfInterval({
            start: yearStart,
            end: now,
        });

        const analytics = {};

        monthsInterval.forEach((monthDate) => {
            const monthName = format(monthDate, 'MMMM');

            const shipmentCount = shipments.filter(
                (s) => format(new Date(s.date_issued), 'MMMM') === monthName
            ).length;

            const tripCount = trips.filter(
                (t) => format(new Date(t.date_delivered!), 'MMMM') === monthName
            ).length;

            analytics[monthName] = {
                created_shipment: shipmentCount,
                delivered_trips: tripCount,
            };
        });

        return analytics;
    }
}
