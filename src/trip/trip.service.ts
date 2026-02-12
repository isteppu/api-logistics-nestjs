import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTripInput } from './dto/create-trip.input.js';
import { UpdateTripInput } from './dto/update-trip.input.js';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateTripInput) {
    const { finances, ...tripData } = data;

    return this.prisma.$transaction(async (tx) => {

      await tx.truck.upsert({
        where: { id: data.truck_id },
        update: {},
        create: {
          id: data.truck_id,
          operator: 'Unknown',
          is_archived: 0
        },
      });

      const trip = await tx.trip.create({
        data: {
          id: crypto.randomUUID(),
          ...tripData,
        },
      });

      if (finances && finances.length > 0) {
        for (const row of finances) {
          const isRevenue = ['base rate', 'tariff rate'].includes(row.title.toLowerCase());

          if (isRevenue) {
            await tx.trip_revenue.create({
              data: {
                trip_id: trip.id,
                value: row.value,
                revenue_map: row.title,
                type: row.type
              }
            });
          } else {
            await tx.trip_expense.create({
              data: {
                trip_id: trip.id,
                value: row.value,
                expense_map: row.title,
                type: row.type
              }
            });
          }
        }
      }
      return trip;
    });
  }

  async update(id: string, data: UpdateTripInput) {
    const { id: _, ...updateData } = data;
    return this.prisma.trip.update({
      where: { id },
      data: updateData,
      include: { truck: true, storable_trip_port_idTostorable: true }
    });
  }

  async findAllPaginated(skip: number, take: number) {
    const [items, totalCount] = await this.prisma.$transaction([
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
}