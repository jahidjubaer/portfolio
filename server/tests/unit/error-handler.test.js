import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "../../src/middleware/error-handler.js";

function createMockResponse() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  it("returns a controlled 500 response for an unexpected error", () => {
    const res = createMockResponse();
    const err = new Error("boom");

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Internal server error",
      }),
    );
  });

  it("respects a custom status code on the error object", () => {
    const res = createMockResponse();
    const err = Object.assign(new Error("bad input"), { status: 400 });

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: "bad input" }),
    );
  });
});
