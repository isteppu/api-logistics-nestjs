import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { randomUUID } from 'crypto';
import { Shipment } from './shipment.js';

@Injectable()
export class ShipmentService extends Shipment {

  /**
   * Ensure a storable exists. If not, create it.
   * Returns the storable id.
   */
  private async ensureStorable(
    tx: any,
    id: string,
    type: 'PORT' | 'WAREHOUSE' | 'CONTAINER',
    description: string,
    createdBy?: string
  ) {
    if (!id) return undefined;

    const existing = await tx.storable.findUnique({ where: { id } });
    if (!existing) {
      await tx.storable.create({
        data: {
          id,
          type,
          description,
          created_by: createdBy,
          date_created: new Date(),
        },
      });
    }
    return id;
  }

  /**
   * Create a new shipment
   */
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

    return this.prisma.$transaction(async (tx) => {

      // Handle port and warehouse
      const portId = await this.ensureStorable(
        tx,
        data.port_id,
        'PORT',
        `${data.port_id} port`,
        issuerId
      );

      const warehouseId = await this.ensureStorable(
        tx,
        data.warehouse_id,
        'WAREHOUSE',
        `${data.warehouse_id} warehouse`,
        issuerId
      );

      // Create shipment
      const shipment = await tx.shipment.create({
        data: {
          id: randomUUID(),
          blno: data.blno,
          contract_no: data.contract_no,
          entry_no: data.entry_no,
          reference: customerId ? this.generateConsigneeReference(data.customer_username!) : randomUUID(),
          registry_no: data.registry_no,
          status: 'PENDING',
          volumex: data.volumex,
          volumey: data.volumey,
          customer_id: customerId,
          issuer_id: issuerId,
          port_id: portId,
          warehouse_id: warehouseId,
          estimated_time_arrival: data.estimated_time_arrival,
          is_archived: 0,
          actual_time_arrival: null,
          date_issued: new Date(),
        },
      });

      // Handle containers
      if (data.containers?.length) {
        const uniqueContainerNames = [...new Set(data.containers)];

        for (const name of uniqueContainerNames) {
          await this.ensureStorable(tx, name, 'CONTAINER', `${name} container`, issuerId);
        }

        await tx.shipment_container.createMany({
          data: uniqueContainerNames.map((name) => ({
            shipment_id: shipment.id,
            container_id: name,
          })),
          skipDuplicates: true,
        });
      }

      return shipment;
    });
  }

  /**
   * Update shipment
   */
  async update(id: string, data: UpdateShipmentInput) {
    const updatePayload: any = { ...data };
    delete updatePayload.id;

    if (data.customer_username) {
      const customer = await this.prisma.user.findUnique({ where: { username: data.customer_username } });
      if (!customer) throw new BadRequestException(`Customer '${data.customer_username}' not found`);
      updatePayload.customer_id = customer.id;
      delete updatePayload.customer_username;
    }

    if (data.issuer_username) {
      const issuer = await this.prisma.user.findUnique({ where: { username: data.issuer_username } });
      if (!issuer) throw new BadRequestException(`Issuer '${data.issuer_username}' not found`);
      updatePayload.issuer_id = issuer.id;
      delete updatePayload.issuer_username;
    }

    return this.prisma.$transaction(async (tx) => {
      // Ensure port and warehouse exist
      if (data.port_id) {
        await this.ensureStorable(tx, data.port_id, 'PORT', `${data.port_id} port`);
      }

      if (data.warehouse_id) {
        await this.ensureStorable(tx, data.warehouse_id, 'WAREHOUSE', `${data.warehouse_id} warehouse`);
      }

      return tx.shipment.update({
        where: { id },
        data: updatePayload,
        include: {
          user_shipment_customer_idTouser: true,
          user_shipment_issuer_idTouser: true,
          storable_shipment_port_idToStorable: true,
          storable_shipment_warehouse_idTostorable: true,
        },
      });
    });
  }

  async findAll(skip: number, take: number) {
    const [rawItems, totalCount] = await Promise.all([
      this.prisma.shipment.findMany({
        skip,
        take,
        orderBy: { date_issued: 'desc' },
        include: {
          user_shipment_customer_idTouser: true,
          user_shipment_issuer_idTouser: true,
        },
      }),
      this.prisma.shipment.count(),
    ]);

    const items = rawItems.map((item) => ({
      ...item,
      customer: item.user_shipment_customer_idTouser,
      issuer: item.user_shipment_issuer_idTouser,
    }));

    return {
      items,
      totalCount,
      hasMore: skip + take < totalCount,
    };
  }

  async search(query: string) {
    const condition = [
      { id: { contains: query } },
      { blno: { contains: query } },
      { reference: { contains: query } },
      { contract_no: { contains: query } },
      { registry_no: { contains: query } },
      { entry_no: { contains: query } },
      { port_id: { contains: query } },
      { warehouse_id: { contains: query } },
      { shipping_line: { contains: query } },
      { status: { contains: query } },
      { contract_no: { contains: query } },
      {
        user_shipment_customer_idTouser: {
          username: { contains: query },
        },
      },
      {
        user_shipment_issuer_idTouser: {
          username: { contains: query },
        },
      },
    ];
    const [items, totalCount] = await Promise.all([
      this.prisma.shipment.findMany({
        where: {
          OR: condition,
        },
        orderBy: { date_issued: 'desc' },
        include: {
          user_shipment_customer_idTouser: true,
          user_shipment_issuer_idTouser: true,
        },
      }),

      this.prisma.shipment.count({
        where: {
          OR: condition,
        },
      }),
    ]);

    const itemMap = items.map((item) => ({
      ...item,
      customer: item.user_shipment_customer_idTouser,
      issuer: item.user_shipment_issuer_idTouser,
    }));

    return {
      items: itemMap,
      totalCount,
      hasMore: false,
    };
  }
}