import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";

describe("GET /api/public/* without a database", () => {
  it("answers 503 with an honest message", async () => {
    env.mongodbUri = "";
    const response = await request(app).get("/api/public/projects");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      success: false,
      error: "Content database is not configured.",
    });
  });
});
