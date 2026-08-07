import { describe, it, expect, vi } from "vitest";
import { createContactRateLimiter } from "../../src/middleware/contactRateLimit.js";

function createMockReqRes(ip = "127.0.0.1") {
  const req = { ip };
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return { req, res };
}

describe("createContactRateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = createContactRateLimiter({
      maxAttempts: 3,
      windowMs: 1000,
    });
    const next = vi.fn();

    for (let i = 0; i < 3; i += 1) {
      const { req, res } = createMockReqRes();
      limiter.middleware(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(3);
  });

  it("blocks the request once the limit is exceeded", () => {
    const limiter = createContactRateLimiter({
      maxAttempts: 2,
      windowMs: 1000,
    });
    const next = vi.fn();

    limiter.middleware(createMockReqRes().req, createMockReqRes().res, next);
    limiter.middleware(createMockReqRes().req, createMockReqRes().res, next);
    const { req, res } = createMockReqRes();
    limiter.middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("tracks each IP independently", () => {
    const limiter = createContactRateLimiter({
      maxAttempts: 1,
      windowMs: 1000,
    });
    const next = vi.fn();

    const a = createMockReqRes("1.1.1.1");
    const b = createMockReqRes("2.2.2.2");
    limiter.middleware(a.req, a.res, next);
    limiter.middleware(b.req, b.res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(a.res.status).not.toHaveBeenCalled();
    expect(b.res.status).not.toHaveBeenCalled();
  });

  it("resets cleanly between test runs via reset()", () => {
    const limiter = createContactRateLimiter({
      maxAttempts: 1,
      windowMs: 1000,
    });
    const next = vi.fn();

    const first = createMockReqRes();
    limiter.middleware(first.req, first.res, next);
    limiter.reset();

    const second = createMockReqRes();
    limiter.middleware(second.req, second.res, next);

    expect(second.res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("allows a new attempt again once the window has elapsed", () => {
    vi.useFakeTimers();
    const limiter = createContactRateLimiter({
      maxAttempts: 1,
      windowMs: 1000,
    });
    const next = vi.fn();

    const first = createMockReqRes();
    limiter.middleware(first.req, first.res, next);

    vi.advanceTimersByTime(1001);

    const second = createMockReqRes();
    limiter.middleware(second.req, second.res, next);

    expect(second.res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
