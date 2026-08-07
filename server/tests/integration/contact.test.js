import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import {
  resetContactRateLimit,
  CONTACT_RATE_LIMIT,
} from "../../src/middleware/contactRateLimit.js";

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

describe("POST /api/contact", () => {
  it("accepts a valid submission and simulates delivery in test", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/contact")
      .send(VALID_PAYLOAD);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true });
  });

  it("returns 400 with field-level errors for missing fields", async () => {
    const response = await request(app).post("/api/contact").send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      subject: expect.any(String),
      message: expect.any(String),
    });
  });

  it("returns 400 for an invalid email", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send({ ...VALID_PAYLOAD, email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(response.body.errors.email).toBeDefined();
  });

  it("returns 400 for an oversized message", async () => {
    const response = await request(app)
      .post("/api/contact")
      .send({ ...VALID_PAYLOAD, message: "a".repeat(2001) });

    expect(response.status).toBe(400);
    expect(response.body.errors.message).toBeDefined();
  });

  it("responds as if a honeypot submission succeeded without delivering it", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/contact")
      .send({ ...VALID_PAYLOAD, companyWebsite: "https://spam.example" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true });
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("never exposes a stack trace in the response", async () => {
    const response = await request(app).post("/api/contact").send({});

    expect(JSON.stringify(response.body)).not.toMatch(/at\s+\S+\s+\(/);
    expect(response.body.stack).toBeUndefined();
  });

  it("returns a controlled 503 in production with no provider configured", async () => {
    const previousEnv = env.nodeEnv;
    env.nodeEnv = "production";
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app)
      .post("/api/contact")
      .send(VALID_PAYLOAD);

    env.nodeEnv = previousEnv;

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
  });

  it("rate-limits after the configured number of accepted attempts", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    for (let i = 0; i < CONTACT_RATE_LIMIT.maxAttempts; i += 1) {
      const response = await request(app)
        .post("/api/contact")
        .send(VALID_PAYLOAD);
      expect(response.status).toBe(200);
    }

    const limited = await request(app).post("/api/contact").send(VALID_PAYLOAD);

    expect(limited.status).toBe(429);
    expect(limited.body.success).toBe(false);
  });

  it("rate limit resets cleanly between isolated test runs", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    for (let i = 0; i < CONTACT_RATE_LIMIT.maxAttempts; i += 1) {
      await request(app).post("/api/contact").send(VALID_PAYLOAD);
    }
    resetContactRateLimit();

    const response = await request(app)
      .post("/api/contact")
      .send(VALID_PAYLOAD);

    expect(response.status).toBe(200);
  });
});
