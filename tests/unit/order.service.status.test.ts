import { describe, expect, it, vi } from "vitest";
import { OrderStatus } from "@prisma/client";
import { OrderService } from "../../src/services/order.service.js";
import { ValidationError } from "../../src/utils/errors.js";

describe("OrderService.updateStatus", () => {
  it("allows NEW → CONFIRMED", async () => {
    const orders = {
      findByReference: vi.fn().mockResolvedValue({
        reference: "AS-AAAAAA",
        status: OrderStatus.NEW,
      }),
      updateStatus: vi.fn().mockResolvedValue({
        reference: "AS-AAAAAA",
        status: OrderStatus.CONFIRMED,
      }),
    };

    const service = new OrderService(orders as never, { sendNewOrderEmail: vi.fn() } as never);
    const result = await service.updateStatus("AS-AAAAAA", OrderStatus.CONFIRMED);
    expect(result.status).toBe(OrderStatus.CONFIRMED);
  });

  it("rejects COMPLETED → NEW", async () => {
    const orders = {
      findByReference: vi.fn().mockResolvedValue({
        reference: "AS-BBBBBB",
        status: OrderStatus.COMPLETED,
      }),
      updateStatus: vi.fn(),
    };

    const service = new OrderService(orders as never, { sendNewOrderEmail: vi.fn() } as never);
    await expect(service.updateStatus("AS-BBBBBB", OrderStatus.NEW)).rejects.toBeInstanceOf(ValidationError);
    expect(orders.updateStatus).not.toHaveBeenCalled();
  });
});
