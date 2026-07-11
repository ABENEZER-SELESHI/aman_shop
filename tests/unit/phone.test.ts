import { describe, expect, it } from "vitest";
import { isValidEthiopianPhone, normalizeEthiopianPhone } from "../../src/utils/phone.js";

describe("Ethiopian phone validation", () => {
  it.each(["0912345678", "0712345678", "+251912345678", "+251712345678", "251912345678"])(
    "accepts %s",
    (phone) => {
      expect(isValidEthiopianPhone(phone)).toBe(true);
    },
  );

  it.each(["0812345678", "091234567", "+251812345678", "12345"])("rejects %s", (phone) => {
    expect(isValidEthiopianPhone(phone)).toBe(false);
  });

  it("normalizes local numbers to +251", () => {
    expect(normalizeEthiopianPhone("0912345678")).toBe("+251912345678");
  });
});
