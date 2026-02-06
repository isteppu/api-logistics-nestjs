import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStorableInput } from './dto/create-storable.input.js';

@Injectable()
export class StorableService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateStorableInput, user: any) {
    return this.prisma.storable.create({
      data: {
        ...data,
        created_by: user.sub || user.id,
      },
    });
  }

  async findAllByType(type: string) {
    return this.prisma.storable.findMany({
      where: { type },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.storable.findUnique({ where: { id } });
  }

  async findAll(skip: number, take: number, type?: string) {
    const where = type ? { type } : {};

    // Run them independently without $transaction
    const items = await this.prisma.storable.findMany({
      where,
      skip,
      take,
      orderBy: { date_created: 'desc' },
    });

    const totalCount = await this.prisma.storable.count({ where });

    return {
      items,
      totalCount,
      hasMore: skip + take < totalCount,
    };
  }
}