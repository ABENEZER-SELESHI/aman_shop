import request from "supertest";
import { describe, expect, it } from "vitest";
import { createExpressApp } from "../../src/app.js";

const runIntegration = process.env.RUN_INTEGRATION_TESTS === "true";

describe.skipIf(!runIntegration)("orders integration", () => {
  it("creates a public order", async () => {
    const app = createExpressApp();

    const response = await request(app)
      .post("/api/v1/orders")
      .send({
        customerName: "Aman",
        customerPhone: "0912345678",
        preferredPickup: "Weekend",
        lines: [{ productId: "p1", name: "Coffee", unitPriceEtb: 100, quantity: 2 }],
        subtotalEtb: 200,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
