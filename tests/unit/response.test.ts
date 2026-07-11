import { describe, expect, it } from "vitest";
import { sendError, sendSuccess } from "../../src/utils/response.js";

describe("response helpers", () => {
  it("sendSuccess writes envelope", () => {
    const json = viFn();
    const res = {
      status: (code: number) => {
        expect(code).toBe(201);
        return { json };
      },
    };
    sendSuccess(res as never, "ok", { id: 1 }, 201);
    expect(json.mock.calls[0][0]).toEqual({
      success: true,
      message: "ok",
      data: { id: 1 },
    });
  });

  it("sendError writes envelope", () => {
    const json = viFn();
    const res = {
      status: (code: number) => {
        expect(code).toBe(400);
        return { json };
      },
    };
    sendError(res as never, "bad", ["x"], 400);
    expect(json.mock.calls[0][0]).toEqual({
      success: false,
      message: "bad",
      errors: ["x"],
    });
  });
});

function viFn() {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  fn.mock = { calls };
  return fn;
}
