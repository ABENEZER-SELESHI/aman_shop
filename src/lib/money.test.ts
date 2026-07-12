import { describe, expect, it } from "vitest";
import { formatEtb } from "@/lib/money";
import { isValidEthiopianPhone, normalizeEthiopianPhone } from "@/lib/phone";
import { getProductBySlug, getProducts } from "@/lib/products";

describe("formatEtb", () => {
  it("formats amounts with birr", () => {
    expect(formatEtb(1850)).toContain("1,850");
    expect(formatEtb(1850)).toContain("ብር");
  });
});

describe("phone", () => {
  it("validates local and international numbers", () => {
    expect(isValidEthiopianPhone("0911234567")).toBe(true);
    expect(isValidEthiopianPhone("+251911234567")).toBe(true);
    expect(isValidEthiopianPhone("123")).toBe(false);
  });

  it("normalizes to +251", () => {
    expect(normalizeEthiopianPhone("0911234567")).toBe("+251911234567");
  });
});

describe("products", () => {
  it("loads catalog with vases and baskets", () => {
    const all = getProducts();
    expect(all.length).toBeGreaterThanOrEqual(8);
    expect(getProducts({ category: "vase" }).every((p) => p.category === "vase")).toBe(true);
    expect(getProductBySlug("amber-stoneware-vase")?.name).toBe("Amber Stoneware Vase");
  });
});
