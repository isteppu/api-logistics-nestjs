import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShipmentInput } from './dto/create-shipment.input.js';
import { UpdateShipmentInput } from './dto/update-shipment.input.js';
import { randomUUID } from 'crypto';
import { Shipment } from './shipment.js';


@Injectable()
export class ShipmentService extends Shipment {

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

  async create(data: CreateShipmentInput, user: any) {
    let customerId: string | undefined;
    let warehouseId: string | undefined;

    console.log("CreateShipmentInput::", data)


    if (data.customer_username) {
      const customer = await this.prisma.user.findUnique({
        where: { username: data.customer_username },
      });
      if (!customer) throw new BadRequestException(`Customer '${data.customer_username}' not found`);
      customerId = customer.id;
    }


    const shipment = await this.prisma.$transaction(async (tx) => {

      const portId = await this.ensureStorable(
        tx,
        data.port_id,
        'PORT',
        `${data.port_id} port`,
        user.sub || user.id
      );


      if (data.warehouse_id) {
        await this.ensureStorable(
          tx,
          data.warehouse_id,
          'WAREHOUSE',
          `${data.warehouse_id} warehouse`,
          user.sub || user.id
        );
      }

      const reference = customerId ? await this.generateConsigneeReference(tx, data.customer_username!, customerId) : randomUUID();

      const shipment = await tx.shipment.create({
        data: {
          id: randomUUID(),
          selectivity: data.selectivity,
          blno: data.blno,
          contract_no: data.contract_no === "" ? null : data.contract_no,
          entry_no: data.entry_no,
          reference: reference,
          registry_no: data.registry_no,
          status: 'PENDING',
          volumex: data.volumex,
          volumey: data.volumey,
          customer_id: customerId,
          issuer_id: user.sub || user.id,
          shipping_line: data.shipping_line,
          port_id: portId,
          warehouse_id: warehouseId,
          estimated_time_arrival: data.estimated_time_arrival,
          is_archived: 0,
          actual_time_arrival: null,
          date_issued: new Date(),
        },
      });

      if (data.finances?.length) {
        for (const row of data.finances) {
          const isRevenue = row.title.toLowerCase().includes('billing');

          if (isRevenue) {
            await tx.revenue.upsert({
              where: { title: row.title },
              update: {},
              create: { title: row.title },
            });

            const rev = await tx.shipment_revenue.create({
              data: {
                value: row.value,
                revenue_map: row.title,
                type: row.type,
              },
            });

            await tx.shipment_revenues.create({
              data: {
                shipment_id: shipment.id,
                revenues_id: rev.id,
              },
            });
          } else {
            await tx.expense.upsert({
              where: { title: row.title },
              update: {},
              create: { title: row.title },
            });

            const exp = await tx.shipment_expense.create({
              data: {
                value: row.value,
                expense_map: row.title,
                type: row.type,
              },
            });

            await tx.shipment_expenses.create({
              data: {
                shipment_id: shipment.id,
                expenses_id: exp.id,
              },
            });
          }
        }
      }

      if (data.containers?.length) {
        for (const item of data.containers) {
          await this.ensureStorable(
            tx,
            item.container_id,
            'CONTAINER',
            `Container ${item.container_id}`,
            user.sub || user.id
          );

          if (item.warehouse_id) {
            await this.ensureStorable(
              tx,
              item.warehouse_id,
              'WAREHOUSE',
              `Warehouse ${item.warehouse_id}`,
              user.sub || user.id
            );
          }

          await tx.shipment_container.create({
            data: {
              shipment_id: shipment.id,
              container_id: item.container_id,
              warehouse_id: item.warehouse_id || null,
            },
          });
        }
      }



      return shipment;
    }, {
        timeout: 30000,
        maxWait: 5000,
    })

    const usernames: string[] = [data.customer_username, data.issuer_username].filter(Boolean) as string[];

    if (usernames.length > 0) {
      await this.notificationService.sendAlert(
        {
          id: shipment.id,
          name: 'New Shipment Created',
          details: `Reference: ${shipment.reference}, BL No: ${shipment.blno}`,
        },
        usernames
      );
    }

    return shipment
  }

  async update(id: string, data: UpdateShipmentInput, user: any) {
    return this.prisma.$transaction(async (tx) => {
      const {
        customer_username,
        issuer_username,
        port_id,
        actual_time_arrival,
        containers,
        finances,
        ...scalarData
      } = data;

      let customerId: string | undefined;
      let issuerId = user.sub || user.id;

      if (customer_username) {
        const customer = await tx.user.findUnique({ where: { username: customer_username } });
        if (!customer) throw new BadRequestException(`Customer '${customer_username}' not found`);
        customerId = customer.id;
      }

      const shipment = await tx.shipment.update({
        where: { id },
        data: {
          ...scalarData,
          status: actual_time_arrival?.toISOString() ? 'ARRIVED' : 'PENDING',

          ...(customerId && {
            user_shipment_customer_idTouser: {
              connect: { id: customerId },
            },
          }),

          ...(port_id && {
            storable_shipment_port_idToStorable: {
              connect: {
                id: await this.ensureStorable(
                  tx,
                  port_id,
                  'PORT',
                  `${port_id} port`,
                  issuerId
                )
              },
            },
          }),


        },
      });

      if (containers) {
        const incomingContainerIds = containers.map(c => c.container_id);

        for (const item of containers) {
          await this.ensureStorable(tx, item.container_id, 'CONTAINER', `Container ${item.container_id}`, issuerId);
          if (item.warehouse_id) {
            await this.ensureStorable(tx, item.warehouse_id, 'WAREHOUSE', `Warehouse ${item.warehouse_id}`, issuerId);
          }
        }

        await tx.shipment_container.deleteMany({
          where: {
            shipment_id: id,
            container_id: { notIn: incomingContainerIds },
          },
        });

        for (const item of containers) {
          await tx.shipment_container.upsert({
            where: {
              shipment_id_container_id: {
                shipment_id: id,
                container_id: item.container_id,
              },
            },
            update: { warehouse_id: item.warehouse_id || null },
            create: {
              shipment_id: id,
              container_id: item.container_id,
              warehouse_id: item.warehouse_id || null,
            },
          });
        }
      }

      if (finances?.length) {
        for (const row of finances) {
          const isRevenue = row.title.toLowerCase().includes('billing');

          if (isRevenue) {
            const existing = await tx.shipment_revenues.findFirst({
              where: {
                shipment_id: shipment.id,
                shipment_revenue: { revenue_map: row.title },
              },
              include: { shipment_revenue: true },
            });

            if (existing) {
              await tx.shipment_revenue.update({
                where: { id: existing.revenues_id },
                data: { value: row.value, type: row.type },
              });
            } else {
              const rev = await tx.shipment_revenue.create({
                data: {
                  value: row.value,
                  revenue_map: row.title,
                  type: row.type,
                },
              });

              await tx.shipment_revenues.create({
                data: {
                  shipment_id: shipment.id,
                  revenues_id: rev.id,
                },
              });
            }
          } else {
            const existing = await tx.shipment_expenses.findFirst({
              where: {
                shipment_id: shipment.id,
                shipment_expense: { expense_map: row.title },
              },
              include: { shipment_expense: true },
            });

            if (existing) {
              await tx.shipment_expense.update({
                where: { id: existing.expenses_id },
                data: { value: row.value, type: row.type },
              });
            } else {
              const exp = await tx.shipment_expense.create({
                data: {
                  value: row.value,
                  expense_map: row.title,
                  type: row.type,
                },
              });

              await tx.shipment_expenses.create({
                data: {
                  shipment_id: shipment.id,
                  expenses_id: exp.id,
                },
              });
            }
          }
        }
      }

      return shipment;
    },
      {
        timeout: 15000,
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
          storable_shipment_port_idToStorable: true,
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
      { selectivity: { contains: query } },
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