import { OrderStatus, type Order, Prisma } from "@prisma/client";
import type { IOrderRepository } from "../interfaces/repositories.js";
import { orderRepository } from "../repositories/order.repository.js";
import { emailService, type EmailService } from "./email.service.js";
import { assertCatalogLines } from "./catalog.service.js";
import { activityLogService } from "./activityLog.service.js";
import type { CreateOrderInput } from "../types/order.js";
import { createOrderId } from "../utils/orderId.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { normalizeEthiopianPhone } from "../utils/phone.js";
import { logger } from "../utils/logger.js";

const MAX_REFERENCE_ATTEMPTS = 5;

export type PublicOrderView = {
  id: string;
  reference: string;
  status: OrderStatus;
  preferredPickup: string;
  subtotalEtb: number;
  payInPerson: boolean;
  createdAt: Date;
  lines: unknown;
  customerName: string;
  customerPhoneMasked: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
};

const maskPhone = (phone: string): string => {
  if (phone.length < 6) return "****";
  return `${phone.slice(0, 4)}****${phone.slice(-3)}`;
};

export const toPublicOrder = (order: Order): PublicOrderView => ({
  id: order.id,
  reference: order.reference,
  status: order.status,
  preferredPickup: order.preferredPickup,
  subtotalEtb: order.subtotalEtb,
  payInPerson: order.payInPerson,
  createdAt: order.createdAt,
  lines: order.lines,
  customerName: order.customerName,
  customerPhoneMasked: maskPhone(order.customerPhone),
  deliveryLat: order.deliveryLat,
  deliveryLng: order.deliveryLng,
});

export class OrderService {
  constructor(
    private readonly orders: IOrderRepository = orderRepository,
    private readonly emails: EmailService = emailService,
  ) {}

  async createOrder(input: CreateOrderInput, requestId?: string): Promise<Order> {
    const lines = await assertCatalogLines(input.lines);
    const subtotal = lines.reduce((sum, line) => sum + line.unitPriceEtb * line.quantity, 0);
    if (subtotal !== input.subtotalEtb) {
      throw new ValidationError("subtotalEtb must equal the sum of line totals", ["subtotalEtb mismatch"]);
    }

    let created: Order | null = null;
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        created = await this.orders.create({
          ...input,
          lines,
          customerPhone: normalizeEthiopianPhone(input.customerPhone),
          customerNote: input.customerNote ?? "",
          reference: createOrderId(),
          status: OrderStatus.NEW,
          payInPerson: true,
        });
        break;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    if (!created) throw lastError instanceof Error ? lastError : new Error("Failed to create order");

    void activityLogService
      .log({
        actorType: "customer",
        action: "order.created",
        entity: "order",
        entityId: created.reference,
        message: `New order ${created.reference} from ${created.customerName}`,
        metadata: { subtotalEtb: created.subtotalEtb },
      })
      .catch(() => undefined);

    this.emails
      .sendNewOrderEmail({
        reference: created.reference,
        customerName: created.customerName,
        customerPhone: created.customerPhone,
        preferredPickup: created.preferredPickup,
        customerNote: created.customerNote,
        subtotalEtb: created.subtotalEtb,
        lines,
      })
      .catch((error: unknown) => {
        logger.error("New order email failed", {
          requestId,
          reference: created.reference,
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return created;
  }

  async getByReference(reference: string): Promise<Order> {
    const order = await this.orders.findByReference(reference);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  async getPublicByReference(reference: string): Promise<PublicOrderView> {
    return toPublicOrder(await this.getByReference(reference));
  }

  async listOrders(filters: { status?: OrderStatus; limit?: number; offset?: number } = {}): Promise<Order[]> {
    return this.orders.list(filters);
  }

  async updateStatus(reference: string, status: OrderStatus, sellerId?: string): Promise<Order> {
    const existing = await this.orders.findByReference(reference);
    if (!existing) throw new NotFoundError("Order not found");

    const allowed: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.NEW]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (existing.status === status) return existing;

    if (!allowed[existing.status].includes(status)) {
      throw new ValidationError(`Cannot transition order from ${existing.status} to ${status}`, [
        `Invalid status transition: ${existing.status} → ${status}`,
      ]);
    }

    const updated = await this.orders.updateStatus(reference, status);
    void activityLogService
      .log({
        actorType: "seller",
        actorId: sellerId,
        action: "order.status_updated",
        entity: "order",
        entityId: reference,
        message: `Order ${reference} moved to ${status}`,
        metadata: { from: existing.status, to: status },
      })
      .catch(() => undefined);
    return updated;
  }
}

export const orderService = new OrderService();
