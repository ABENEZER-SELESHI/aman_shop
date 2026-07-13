import { OrderStatus, type Order } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IOrderRepository } from "../../src/interfaces/repositories.js";
import { OrderService } from "../../src/services/order.service.js";
import type { EmailService } from "../../src/services/email.service.js";

vi.mock("../../src/services/catalog.service.js", () => ({
  assertCatalogLines: vi.fn(async (lines: Array<{ productId: string; name: string; unitPriceEtb: number; quantity: number }>) =>
    lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      unitPriceEtb: line.unitPriceEtb,
      quantity: line.quantity,
    })),
  ),
}));

vi.mock("../../src/services/activityLog.service.js", () => ({
  activityLogService: { log: vi.fn(async () => undefined) },
}));

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "9a17f8bf-cd23-4654-b4d2-a202665d24af",
  reference: "AS-ABC123",
  status: OrderStatus.NEW,
  customerName: "Aman",
  customerPhone: "+251912345678",
  customerNote: "",
  preferredPickup: "Weekend",
  lines: [{ productId: "vase-amber-01", name: "Amber Stoneware Vase", unitPriceEtb: 1850, quantity: 1 }],
  subtotalEtb: 1850,
  payInPerson: true,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
  ...overrides,
});

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
      lines: [{ productId: "vase-amber-01", name: "Amber Stoneware Vase", unitPriceEtb: 1850, quantity: 1 }],
      subtotalEtb: 1850,
    });

    expect(order.status).toBe(OrderStatus.NEW);
    expect(order.payInPerson).toBe(true);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerPhone: "+251912345678", payInPerson: true }),
    );
  });

  it("rejects mismatched subtotals", async () => {
    const { assertCatalogLines } = await import("../../src/services/catalog.service.js");
    vi.mocked(assertCatalogLines).mockResolvedValueOnce([
      { productId: "vase-amber-01", name: "Amber Stoneware Vase", unitPriceEtb: 1850, quantity: 1 },
    ]);

    const repo = { create: vi.fn() } as unknown as IOrderRepository;
    const service = new OrderService(repo, { sendNewOrderEmail: vi.fn() } as unknown as EmailService);

    await expect(
      service.createOrder({
        customerName: "Aman",
        customerPhone: "0912345678",
        preferredPickup: "Weekend",
        lines: [{ productId: "vase-amber-01", name: "Amber Stoneware Vase", unitPriceEtb: 1850, quantity: 1 }],
        subtotalEtb: 1849,
      }),
    ).rejects.toThrow("subtotalEtb");
  });
});
