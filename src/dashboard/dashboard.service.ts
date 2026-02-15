import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalPending, totalTransit, totalDelivered] = await Promise.all([
            this.prisma.shipment.count({
                where: { status: 'PENDING' },
            }),

            this.prisma.trip.count({
                where: { date_delivered: null },
            }),

            this.prisma.trip.count({
                where: { NOT: { date_delivered: null } },
            }),
        ]);

        return {
            'Total Pending': totalPending,
            'Total Transit': totalTransit,
            'Total Delivered': totalDelivered,
        };
    }
}
