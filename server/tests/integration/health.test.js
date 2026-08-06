import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 with the required response shape", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      service: "jahid-portfolio-api",
      status: "ok",
    });
    expect(response.body).toHaveProperty("timestamp");
  });
});

describe("Unknown /api routes", () => {
  it("returns a controlled JSON 404", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      error: "Not found",
    });
  });
});

describe("JSON body parsing", () => {
  it("parses JSON request bodies without error", async () => {
    const response = await request(app)
      .post("/api/health")
      .send({ ignored: true })
      .set("Content-Type", "application/json");

    // /api/health only defines GET, so POST correctly falls through to the
    // API 404 handler rather than crashing — this proves express.json()
    // parsed the body without throwing.
    expect(response.status).toBe(404);
  });
});

describe("GET /", () => {
  it("returns a minimal API-identification response", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      service: "jahid-portfolio-api",
    });
  });
});
