import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateShipmentInput) {
    let customerId: string | undefined;
    let issuerId: string | undefined;

    if (data.customer_username) {
      const customer = await this.prisma.user.findUnique({
        where: { username: data.customer_username },
      });
      if (!customer) throw new BadRequestException(`Customer '${data.customer_username}' not found`);
      customerId = customer.id;
    }

    if (data.issuer_username) {
      const issuer = await this.prisma.user.findUnique({
        where: { username: data.issuer_username },
      });
      if (!issuer) throw new BadRequestException(`Issuer '${data.issuer_username}' not found`);
      issuerId = issuer.id;
    }

    return this.prisma.shipment.create({
      data: {
        id: data.id,
        blno: data.blno,
        contract_no: data.contract_no,
        entry_no: data.entry_no,
        reference: data.reference,
        registry_no: data.registry_no,
        status: 'PENDING',
        volumex: data.volumex,
        volumey: data.volumey,
        customer_id: customerId,
        issuer_id: issuerId,
        estimated_time_arrival: data.estimated_time_arrival,
        is_archived: 0,
        actual_time_arrival: null,
        date_issued: new Date(),
      },
      include: {
        user_shipment_customer_idTouser: true,
        user_shipment_issuer_idTouser: true,
      }
    });
  }

  async findAll(skip: number, take: number) {
    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.shipment.findMany({
        skip,
        take,
        orderBy: { date_issued: 'desc' },
        include: {
          user_shipment_customer_idTouser: true,
          user_shipment_issuer_idTouser: true,
        }
      }),
      this.prisma.shipment.count(),
    ]);

    return {
      items,
      totalCount,
      hasMore: skip + take < totalCount,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} shipment`;
  }

  update(id: number, updateShipmentInput: UpdateShipmentInput) {
    return `This action updates a #${id} shipment`;
  }

  remove(id: number) {
    return `This action removes a #${id} shipment`;
  }
}
