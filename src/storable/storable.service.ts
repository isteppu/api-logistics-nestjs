import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStorableInput } from './dto/create-storable.input.js';

@Injectable()
export class StorableService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStorableInput, userId: string) {
    return this.prisma.storable.create({
      data: {
        ...data,
        created_by: userId,
      },
    });
  }

  // This is for her dropdown!
  async findAllByType(type: string) {
    return this.prisma.storable.findMany({
      where: { type },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.storable.findUnique({ where: { id } });
  }
}