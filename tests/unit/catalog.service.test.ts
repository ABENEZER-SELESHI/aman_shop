import { describe, expect, it } from "vitest";
import { assertCatalogLines } from "../../src/services/catalog.service.js";
import { ValidationError } from "../../src/utils/errors.js";

describe("assertCatalogLines", () => {
  it("accepts valid catalog lines", async () => {
    const lines = await assertCatalogLines([
      { productId: "vase-amber-01", name: "wrong", unitPriceEtb: 1850, quantity: 1 },
    ]);
    expect(lines[0].name).toBe("Amber Stoneware Vase");
  }, 20_000);

  it("rejects unavailable products", async () => {
    await expect(
      assertCatalogLines([
        { productId: "vase-clay-05", name: "Clay Blush Bottle Vase", unitPriceEtb: 1450, quantity: 1 },
      ]),
    ).rejects.toBeInstanceOf(ValidationError);
  }, 20_000);

  it("rejects price tampering", async () => {
    await expect(
      assertCatalogLines([
        { productId: "vase-amber-01", name: "Amber Stoneware Vase", unitPriceEtb: 1, quantity: 1 },
      ]),
    ).rejects.toBeInstanceOf(ValidationError);
  }, 20_000);
});
