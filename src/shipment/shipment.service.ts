import { Injectable } from '@nestjs/common';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService){}

  create(createShipmentInput: CreateShipmentInput) {
    return 'This action adds a new shipment';
  }

  findAll() {
    return this.prisma.shipment.findMany({
    include: {
      user_shipment_customer_idTouser: true,
      user_shipment_issuer_idTouser: true,
    },
  });
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
