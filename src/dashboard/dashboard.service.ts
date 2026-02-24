import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
}
