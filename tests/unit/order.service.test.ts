import { OrderStatus, type Order } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import type { IOrderRepository } from "../../src/interfaces/repositories.js";
import { OrderService } from "../../src/services/order.service.js";
import type { EmailService } from "../../src/services/email.service.js";

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "9a17f8bf-cd23-4654-b4d2-a202665d24af",
  reference: "AS-ABC123",
  status: OrderStatus.NEW,
  customerName: "Aman",
  customerPhone: "+251912345678",
  customerNote: "",
  preferredPickup: "Weekend",
  lines: [{ productId: "p1", name: "Coffee", unitPriceEtb: 100, quantity: 2 }],
  subtotalEtb: 200,
  payInPerson: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
  ...overrides,
});

describe("OrderService", () => {
  it("creates an order with normalized phone, NEW status, and pay-in-person", async () => {
    const repo: IOrderRepository = {
      create: vi.fn(async (data) => makeOrder({ reference: data.reference, customerPhone: data.customerPhone })),
      findByReference: vi.fn(),
      list: vi.fn(),
      updateStatus: vi.fn(),
    };
    const email = { sendNewOrderEmail: vi.fn(async () => undefined) } as unknown as EmailService;
    const service = new OrderService(repo, email);

    const order = await service.createOrder({
      customerName: "Aman",
      customerPhone: "0912345678",
      preferredPickup: "Weekend",
      lines: [{ productId: "p1", name: "Coffee", unitPriceEtb: 100, quantity: 2 }],
      subtotalEtb: 200,
    });

    expect(order.status).toBe(OrderStatus.NEW);
    expect(order.payInPerson).toBe(true);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ customerPhone: "+251912345678", payInPerson: true }));
  });

  it("rejects mismatched subtotals", async () => {
    const repo = { create: vi.fn() } as unknown as IOrderRepository;
    const service = new OrderService(repo, { sendNewOrderEmail: vi.fn() } as unknown as EmailService);

    await expect(
      service.createOrder({
        customerName: "Aman",
        customerPhone: "0912345678",
        preferredPickup: "Weekend",
        lines: [{ productId: "p1", name: "Coffee", unitPriceEtb: 100, quantity: 2 }],
        subtotalEtb: 199,
      }),
    ).rejects.toThrow("subtotalEtb");
  });
});
