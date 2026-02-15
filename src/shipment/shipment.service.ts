import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { NotificationService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { randomUUID } from 'crypto';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService, private notificationService: NotificationService) { }

  async create(data: CreateShipmentInput) {
    let customerId: string | undefined;
    let issuerId: string | undefined;

    // 1. Resolve User IDs
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

    // 2. Start Transaction
    return this.prisma.$transaction(async (tx) => {
      // A. Create the Shipment
      const shipment = await tx.shipment.create({
        data: {
          id: randomUUID(),
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

      if (data.finances && data.finances.length > 0) {
        for (const row of data.finances) {
          const isRevenue = row.title.toLowerCase().includes('billing');

          if (isRevenue) {
            await tx.revenue.upsert({
              where: { title: row.title },
              update: {},
              create: { title: row.title },
            });

            const rev = await tx.shipment_revenue.create({
              data: { value: row.value, revenue_map: row.title, type: row.type }
            });

            await tx.shipment_revenues.create({
              data: { shipment_id: shipment.id, revenues_id: rev.id }
            });
          } else {
            await tx.expense.upsert({
              where: { title: row.title },
              update: {},
              create: { title: row.title },
            });

            const exp = await tx.shipment_expense.create({
              data: { value: row.value, expense_map: row.title, type: row.type }
            });

            await tx.shipment_expenses.create({
              data: { shipment_id: shipment.id, expenses_id: exp.id }
            });
          }
        }
      }


      await this.notificationService.blastNotification(
        `New Shipment: ${shipment.blno} was added by ${data.issuer_username}`,
        'SHIPMENT_CREATED',
        shipment.id,
        shipment.issuer_id || ''
      ).catch(err => {
        console.error('Background Notification Error:', err);
      });


      return shipment;
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

  async findOne(id: string) {
    const [items] = await this.prisma.shipment.findMany({
      where: { id },
      orderBy: { date_issued: 'desc' },
      include: {
        user_shipment_customer_idTouser: true,
        user_shipment_issuer_idTouser: true,
      }
    })

    return {
      items
    };
  }

  async update(id: string, data: UpdateShipmentInput) {
    const updatePayload: any = { ...data };
    delete updatePayload.id;

    if (data.customer_username) {
      const customer = await this.prisma.user.findUnique({
        where: { username: data.customer_username },
      });
      if (!customer) throw new BadRequestException(`Customer '${data.customer_username}' not found`);
      updatePayload.customer_id = customer.id;
      delete updatePayload.customer_username;
    }

    if (data.issuer_username) {
      const issuer = await this.prisma.user.findUnique({
        where: { username: data.issuer_username },
      });
      if (!issuer) throw new BadRequestException(`Issuer '${data.issuer_username}' not found`);
      updatePayload.issuer_id = issuer.id;
      delete updatePayload.issuer_username;
    }

    return this.prisma.shipment.update({
      where: { id },
      data: updatePayload,
      include: {
        user_shipment_customer_idTouser: true,
        user_shipment_issuer_idTouser: true,
        storable: true,
      }
    });
  }


  remove(id: number) {
    return `This action removes a #${id} shipment`;
  }
}
