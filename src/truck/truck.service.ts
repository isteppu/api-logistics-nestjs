import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTruckInput, UpdateTruckInput } from './dto/truck.input.js';

@Injectable()
export class TruckService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateTruckInput) {
    return this.prisma.truck.create({ data });
  }

  async update(id: string, data: UpdateTruckInput) {
    const { id: _, ...updateData } = data;
    return this.prisma.truck.update({
      where: { id },
      data: updateData,
    });
  }

  async archive(id: string) {
    return this.prisma.truck.update({
      where: { id },
      data: { is_archived: 1 }, // 1 = Archived, 0 = Active
    });
  }

  async restore(id: string) {
    return this.prisma.truck.update({
      where: { id },
      data: { is_archived: 0 },
    });
  }

  async findAll(skip: number, take: number, showArchived = false) {
    const where = showArchived ? {} : { is_archived: 0 };

    const items = await this.prisma.truck.findMany({
      where,
      skip,
      take,
      orderBy: { id: 'asc' },
    });

    const totalCount = await this.prisma.truck.count({ where });

    return {
      items,
      totalCount,
      hasMore: skip + take < totalCount,
    };
  }
}