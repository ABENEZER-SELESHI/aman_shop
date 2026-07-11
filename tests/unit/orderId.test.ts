import { describe, expect, it } from "vitest";
import { ORDER_ID_CHARSET } from "../../src/constants/index.js";
import { createOrderId } from "../../src/utils/orderId.js";

describe("createOrderId", () => {
  it("creates AS-prefixed six-character references", () => {
    const id = createOrderId();

    expect(id).toMatch(/^AS-[A-Z0-9]{6}$/);
    expect([...id.slice(3)].every((char) => ORDER_ID_CHARSET.includes(char))).toBe(true);
  });

  it("generates varied references", () => {
    const ids = new Set(Array.from({ length: 100 }, () => createOrderId()));

    expect(ids.size).toBeGreaterThan(90);
  });
});
