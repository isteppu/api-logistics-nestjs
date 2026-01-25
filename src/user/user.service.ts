import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePasswordInput } from './dto/update-user.input.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }
    async findAll(skip: number, take: number) {
        const [items, totalCount] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take,
                orderBy: { date_created: 'desc' }
            }),
            this.prisma.user.count(),
        ]);
        return {
            items,
            totalCount,
            hasMore: skip + take < totalCount,
        };
    }

    findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    update(updatePasswordInput: UpdatePasswordInput) {
        return `This action updates a #${updatePasswordInput.id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
