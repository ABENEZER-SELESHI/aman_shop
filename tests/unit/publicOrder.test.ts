import { describe, expect, it } from "vitest";
import { toPublicOrder } from "../../src/services/order.service.js";
import { OrderStatus, type Order } from "@prisma/client";

describe("toPublicOrder", () => {
  it("masks phone and omits customer note", () => {
    const order = {
      id: "9a17f8bf-cd23-4654-b4d2-a202665d24af",
      reference: "AS-ABC123",
      status: OrderStatus.NEW,
      customerName: "Aman",
      customerPhone: "+251912345678",
      customerNote: "secret note",
      preferredPickup: "Weekend",
      lines: [],
      subtotalEtb: 100,
      payInPerson: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Order;

    const view = toPublicOrder(order);
    expect(view.customerPhoneMasked).toBe("+251****678");
    expect(view).not.toHaveProperty("customerNote");
    expect(view).not.toHaveProperty("customerPhone");
  });
});
