import { describe, expect, it } from "vitest";
import { formatEtb } from "@/lib/money";
import { isValidEthiopianPhone, normalizeEthiopianPhone } from "@/lib/phone";
import { getLocalProductBySlug, getLocalProducts } from "@/lib/products";

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
    const all = getLocalProducts();
    expect(all.length).toBeGreaterThanOrEqual(8);
    expect(getLocalProducts({ category: "vases" }).every((p) => p.category === "vases")).toBe(true);
    expect(getLocalProducts({ category: "baskets" }).every((p) => p.category === "baskets")).toBe(true);
    expect(getLocalProductBySlug("amber-stoneware-vase")?.name).toBe("Amber Stoneware Vase");
  });
});
