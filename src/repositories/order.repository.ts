import type { Order, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import type { CreateOrderRecord, IOrderRepository, OrderListFilters } from "../interfaces/repositories.js";

export class OrderRepository implements IOrderRepository {
  async create(data: CreateOrderRecord): Promise<Order> {
    return prisma.order.create({
      data: {
        reference: data.reference,
        status: data.status,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerNote: data.customerNote,
        preferredPickup: data.preferredPickup,
        lines: data.lines as unknown as Prisma.InputJsonValue,
        subtotalEtb: data.subtotalEtb,
        payInPerson: true,
      },
    });
  }

  async findByReference(reference: string): Promise<Order | null> {
    return prisma.order.findFirst({ where: { reference, deletedAt: null } });
  }

  async list(filters: OrderListFilters = {}): Promise<Order[]> {
    return prisma.order.findMany({
      where: { deletedAt: null, ...(filters.status ? { status: filters.status } : {}) },
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    });
  }

  async updateStatus(reference: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({ where: { reference }, data: { status } });
  }
}

export const orderRepository = new OrderRepository();
