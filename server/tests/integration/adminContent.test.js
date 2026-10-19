import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { closeDb, getDb } from "../../src/db/client.js";
import { seedDatabase } from "../../src/db/seed.js";
import { createSessionToken } from "../../src/auth/session.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const content = buildSeedContent();
const original = { ...env };
let mongo;
let cookie;

/** An authenticated request from the site itself. */
function as(method, path) {
  return request(app)[method](path).set("Origin", ORIGIN).set("Cookie", cookie);
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-admin-test",
    clientOrigin: ORIGIN,
    githubClientId: "id",
    githubClientSecret: "secret",
    sessionSecret: "s".repeat(40),
    adminGithubId: ADMIN.id,
  });
  cookie = `admin_session=${await createSessionToken(ADMIN)}`;
}, 120_000);

beforeEach(async () => {
  const db = await getDb();
  await db.dropDatabase();
  await seedDatabase(db, content);
});

afterAll(async () => {
  await closeDb();
  await mongo?.stop();
  Object.assign(env, original);
});

describe("admin content API", () => {
  it("requires sign-in", async () => {
    const response = await request(app).get("/api/admin/content");
    expect(response.status).toBe(401);
  });

  it("returns every collection for the editors", async () => {
    const response = await as("get", "/api/admin/content");
    expect(response.status).toBe(200);
    expect(response.body.data.projects).toHaveLength(content.projects.length);
  });

  it("saves the profile and reports field errors", async () => {
    const updated = { ...content.profile, heroHeadline: "New headline." };
    const ok = await as("put", "/api/admin/singletons/profile").send(updated);
    expect(ok.status).toBe(200);
    const read = await request(app).get("/api/public/profile");
    expect(read.body.data.heroHeadline).toBe("New headline.");

    const bad = await as("put", "/api/admin/singletons/profile").send({
      ...content.profile,
      email: "not-an-email",
    });
    expect(bad.status).toBe(400);
    expect(bad.body.issues).toEqual([
      expect.objectContaining({ path: "email" }),
    ]);
  });

  it("rejects unknown collection names", async () => {
    const response = await as("put", "/api/admin/singletons/users").send({});
    expect(response.status).toBe(404);
  });

  it("creates, updates, and deletes a certification", async () => {
    const certificate = {
      id: "new-cert",
      title: "New certificate",
      issuer: "Issuer",
      category: "leadership",
      status: "completed",
      issued: "2026",
    };
    const created = await as("post", "/api/admin/lists/certifications").send(
      certificate,
    );
    expect(created.status).toBe(201);
    expect(created.body.data.order).toBe(content.certifications.length);

    const duplicate = await as("post", "/api/admin/lists/certifications").send(
      certificate,
    );
    expect(duplicate.status).toBe(409);

    const updated = await as(
      "put",
      "/api/admin/lists/certifications/new-cert",
    ).send({ ...certificate, title: "Renamed" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe("Renamed");

    const renamed = await as(
      "put",
      "/api/admin/lists/certifications/new-cert",
    ).send({ ...certificate, id: "other" });
    expect(renamed.status).toBe(400);

    const removed = await as(
      "delete",
      "/api/admin/lists/certifications/new-cert",
    );
    expect(removed.status).toBe(200);
    const again = await as(
      "delete",
      "/api/admin/lists/certifications/new-cert",
    );
    expect(again.status).toBe(404);
  });

  it("reorders a list only with a complete permutation", async () => {
    const slugs = content.projects.map((project) => project.slug);
    const reversed = [...slugs].reverse();

    const ok = await as("put", "/api/admin/lists/projects/order").send({
      keys: reversed,
    });
    expect(ok.status).toBe(200);
    const read = await request(app).get("/api/public/projects");
    expect(read.body.data.map((project) => project.slug)).toEqual(reversed);

    const partial = await as("put", "/api/admin/lists/projects/order").send({
      keys: reversed.slice(1),
    });
    expect(partial.status).toBe(400);
  });

  it("blocks writes from another site", async () => {
    const response = await request(app)
      .put("/api/admin/singletons/profile")
      .set("Origin", "https://evil.example")
      .set("Cookie", cookie)
      .send(content.profile);
    expect(response.status).toBe(403);
  });
});
