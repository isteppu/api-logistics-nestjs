import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTripInput } from './dto/create-trip.input.js';
import { UpdateTripInput } from './dto/update-trip.input.js';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTripInput) {
    return this.prisma.trip.create({
      data,
      include: { truck: true, storable_trip_port_idTostorable: true }
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