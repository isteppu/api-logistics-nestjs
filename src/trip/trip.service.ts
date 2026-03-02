import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTripInput } from './dto/create-trip.input.js';
import { UpdateTripInput } from './dto/update-trip.input.js';
import { NotificationService } from '../notifications/notifications.service.js';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService, private notificationService: NotificationService) { }

  async create(data: CreateTripInput) {
    const { finances, ...tripData } = data;

    const trip = await this.prisma.$transaction(async (tx) => {
      await tx.truck.upsert({
        where: { id: data.truck_id },
        update: {},
        create: {
          id: data.truck_id,
          operator: 'Unknown',
          is_archived: 0
        },
      });

      const newTrip = await tx.trip.create({
        data: {
          id: crypto.randomUUID(),
          ...tripData,
        },
      });

      if (finances && finances.length > 0) {
        const revenueRows = finances
          .filter(f => ['tariff rate'].includes(f.title.toLowerCase()))
          .map(r => ({
            trip_id: newTrip.id,
            value: r.value,
            revenue_map: r.title,
            type: r.type
          }));

        const expenseRows = finances
          .filter(f => !['tariff rate'].includes(f.title.toLowerCase()))
          .map(e => ({
            trip_id: newTrip.id,
            value: e.value,
            expense_map: e.title,
            type: e.type
          }));

        if (revenueRows.length > 0) await tx.trip_revenue.createMany({ data: revenueRows });
        if (expenseRows.length > 0) await tx.trip_expense.createMany({ data: expenseRows });
      }

      return newTrip;
    }, {
      timeout: 10000
    });

    setImmediate(async () => {
      try {
        const truck = await this.prisma.truck.findUnique({
          where: { id: trip.truck_id ?? '' },
          select: { operator: true }
        });

        const notificationDetails = `New Trip: ${trip.id} was added using truck ${trip.truck_id}, operator: ${truck?.operator ?? 'Unknown'}`;

        await this.notificationService.sendAlert({
          name: "TRIP",
          id: trip.id,
          details: notificationDetails
        }, []);
      } catch (err) {
        console.error("Background notification failed:", err);
      }
    });

    return trip;
  }

  async update(id: string, data: UpdateTripInput) {
    const { id: _ignored, finances, ...tripData } = data;

    const updatedTrip = await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.update({
        where: { id },
        data: tripData,
        include: {
          truck: true,
          storable_trip_port_idTostorable: true,
          storable_trip_container_idTostorable: true,
          storable_trip_warehouse_idTostorable: true,
        },
      });

      if (finances) {
        await tx.trip_revenue.deleteMany({ where: { trip_id: id } });
        await tx.trip_expense.deleteMany({ where: { trip_id: id } });

        const revenueRows = finances
          .filter(f => f.title?.toLowerCase() === 'tariff rate')
          .map(r => ({
            trip_id: id,
            value: r.value,
            revenue_map: r.title,
            type: r.type,
          }));

        const expenseRows = finances
          .filter(f => f.title?.toLowerCase() !== 'tariff rate')
          .map(e => ({
            trip_id: id,
            value: e.value,
            expense_map: e.title,
            type: e.type,
          }));

        if (revenueRows.length) await tx.trip_revenue.createMany({ data: revenueRows });
        if (expenseRows.length) await tx.trip_expense.createMany({ data: expenseRows });
      }

      return trip;
    }, {
      timeout: 5000,
    });

    try {
      await this.notificationService.sendAlert(
        {
          name: 'Updated Trip',
          id,
          details: `Update Trip: ${id} has new updates!`,
        },
        []
      );
    } catch (err) {
      console.error('Trip update notification failed:', err);
    }

    return updatedTrip;
  }


  async findAllPaginated(skip: number, take: number) {
    const [items, totalCount] = await Promise.all([
      this.prisma.trip.findMany({
        skip,
        take,
        orderBy: { date_created: 'desc' },
        include: {
          truck: true,
          storable_trip_container_idTostorable: true,
          storable_trip_port_idTostorable: true,
          storable_trip_warehouse_idTostorable: true,
        },
      }),
      this.prisma.trip.count(),
    ]);

    return { items, totalCount, hasMore: skip + take < totalCount };
  }


  async search(query: string) {
    const condition = [
      { id: { contains: query } },
      { commodity: { contains: query } },
      { container_id: { contains: query } },
      { port_id: { contains: query } },
      { warehouse_id: { contains: query } },
      { truck_id: { contains: query } },
    ]
    const [items, totalCount] = await Promise.all([
      this.prisma.trip.findMany({
        where: {
          OR: condition,
        },
        include: {
          truck: true,
          storable_trip_container_idTostorable: true,
          storable_trip_port_idTostorable: true,
          storable_trip_warehouse_idTostorable: true,
        },
        orderBy: { date_created: 'desc' },
      }),

      this.prisma.trip.count({
        where: {
          OR: condition,
        },
      }),
    ]);

    return {
      items,
      totalCount,
      hasMore: false,
    };
  }
}