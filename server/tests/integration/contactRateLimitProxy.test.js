import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import {
  resetContactRateLimit,
  CONTACT_RATE_LIMIT,
} from "../../src/middleware/contactRateLimit.js";

/**
 * Verifies req.ip resolution behind Vercel's single proxy hop
 * (app.set("trust proxy", 1) in app.js) — specifically that only the
 * trusted hop nearest to us (the last X-Forwarded-For entry, which Vercel's
 * edge itself appends) determines rate-limit identity, and that earlier,
 * client-suppliable entries in the same header cannot be used to spoof a
 * different identity or evade the limiter.
 */

const VALID_PAYLOAD = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Project inquiry",
  message: "Hello, I'd like to discuss a potential project with you.",
};

beforeEach(() => {
  resetContactRateLimit();
});

afterEach(() => {
  resetContactRateLimit();
  vi.restoreAllMocks();
});

describe("POST /api/contact — rate limiting behind a trusted proxy", () => {
  it("resolves req.ip from the trusted (last) X-Forwarded-For entry", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "203.0.113.9")
      .send(VALID_PAYLOAD);

    expect(response.status).toBe(200);
  });

  it("keeps two distinct real client IPs in separate buckets", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    for (let i = 0; i < CONTACT_RATE_LIMIT.maxAttempts; i += 1) {
      const response = await request(app)
        .post("/api/contact")
        .set("X-Forwarded-For", "203.0.113.9")
        .send(VALID_PAYLOAD);
      expect(response.status).toBe(200);
    }
    const firstIpLimited = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "203.0.113.9")
      .send(VALID_PAYLOAD);
    expect(firstIpLimited.status).toBe(429);

    // A different real client IP must not be affected by the first one's limit.
    const secondIpResponse = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "198.51.100.4")
      .send(VALID_PAYLOAD);
    expect(secondIpResponse.status).toBe(200);
  });

  it("still returns 429 once the same real client IP exceeds the limit", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    for (let i = 0; i < CONTACT_RATE_LIMIT.maxAttempts; i += 1) {
      await request(app)
        .post("/api/contact")
        .set("X-Forwarded-For", "203.0.113.9")
        .send(VALID_PAYLOAD);
    }

    const limited = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "203.0.113.9")
      .send(VALID_PAYLOAD);

    expect(limited.status).toBe(429);
    expect(limited.body.success).toBe(false);
  });

  it("ignores a spoofed, client-supplied hop prepended before the trusted entry", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    // A malicious client could send its own fabricated leading entry, but
    // with trust proxy = 1 only the single trusted (last) hop counts — so
    // this must land in the exact same bucket as the bare "203.0.113.9"
    // requests above, not a fresh one.
    for (let i = 0; i < CONTACT_RATE_LIMIT.maxAttempts; i += 1) {
      const response = await request(app)
        .post("/api/contact")
        .set("X-Forwarded-For", `1.2.3.${i}, 203.0.113.9`)
        .send(VALID_PAYLOAD);
      expect(response.status).toBe(200);
    }

    const limited = await request(app)
      .post("/api/contact")
      .set("X-Forwarded-For", "9.9.9.9, 203.0.113.9")
      .send(VALID_PAYLOAD);

    expect(limited.status).toBe(429);
  });
});
