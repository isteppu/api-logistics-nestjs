import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { startOfYear, format, eachWeekOfInterval, startOfWeek, subWeeks } from 'date-fns';

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

    async getWeeklyAnalytics() {
        const now = new Date();
        const startDate = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 }); // 4 weeks ago, start of that week
      
        const [shipments, trips] = await Promise.all([
          this.prisma.shipment.findMany({
            where: { date_issued: { gte: startDate } },
            select: { date_issued: true },
          }),
          this.prisma.trip.findMany({
            where: { date_delivered: { gte: startDate } },
            select: { date_delivered: true },
          }),
        ]);
      
        const weeksInterval = eachWeekOfInterval({
          start: startDate,
          end: now,
          weekStartsOn: 1, 
        });
      
        const analytics: Record<string, { created_shipments: number; delivered_trips: number }> = {};
      
        weeksInterval.forEach((weekStart) => {
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000); 
      
          const weekLabel = format(weekStart, 'yyyy-MM-dd');
      
          const shipmentCount = shipments.filter(
            (s) => s.date_issued >= weekStart && s.date_issued < weekEnd
          ).length;
      
          const tripCount = trips.filter(
            (t) => t.date_delivered! >= weekStart && t.date_delivered! < weekEnd
          ).length;
      
          analytics[weekLabel] = {
            created_shipments: shipmentCount,
            delivered_trips: tripCount,
          };
        });
      
        return analytics;
    }
}
