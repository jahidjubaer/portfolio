import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { closeDb, getDb } from "../../src/db/client.js";
import { COLLECTIONS } from "../../src/db/collections.js";
import { seedDatabase } from "../../src/db/seed.js";
import { createSessionToken } from "../../src/auth/session.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const HOOK = "https://api.vercel.com/v1/integrations/deploy/prj_x/secret";
const original = { ...env };
let mongo;
let cookie;

function as(method, path) {
  return request(app)[method](path).set("Origin", ORIGIN).set("Cookie", cookie);
}

function stubHook(
  status = 201,
  body = { job: { id: "job_1", state: "PENDING" } },
) {
  const hook = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", hook);
  return hook;
}

async function publishing() {
  const { body } = await as("get", "/api/admin/content");
  return body.data.publishing;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-publish-test",
    clientOrigin: ORIGIN,
    githubClientId: "id",
    githubClientSecret: "secret",
    sessionSecret: "s".repeat(40),
    adminGithubId: ADMIN.id,
  });
  cookie = `admin_session=${await createSessionToken(ADMIN)}`;
}, 120_000);

beforeEach(async () => {
  vi.unstubAllGlobals();
  env.deployHookUrl = HOOK;
  const db = await getDb();
  await db.dropDatabase();
  await seedDatabase(db, buildSeedContent());
});

afterAll(async () => {
  vi.unstubAllGlobals();
  await closeDb();
  await mongo?.stop();
  Object.assign(env, original);
});

describe("POST /api/admin/publish", () => {
  it("requires sign-in", async () => {
    await request(app)
      .post("/api/admin/publish")
      .set("Origin", ORIGIN)
      .expect(401);
  });

  it("answers 503 until a deploy hook is set", async () => {
    env.deployHookUrl = "";
    const response = await as("post", "/api/admin/publish");
    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/VERCEL_DEPLOY_HOOK_URL/);
    expect((await publishing()).configured).toBe(false);
  });

  it("calls the deploy hook and tracks unpublished changes", async () => {
    expect(await publishing()).toMatchObject({
      configured: true,
      hasUnpublishedChanges: false,
      history: [],
    });

    // Any admin save marks the site as changed.
    const skills = buildSeedContent().skills;
    await as("put", "/api/admin/lists/skills/order")
      .send({ keys: skills.map((group) => group.id).reverse() })
      .expect(200);
    expect((await publishing()).hasUnpublishedChanges).toBe(true);

    const hook = stubHook();
    const response = await as("post", "/api/admin/publish");
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      ok: true,
      by: "jahidjubaer",
      jobId: "job_1",
    });
    expect(hook).toHaveBeenCalledWith(
      HOOK,
      expect.objectContaining({ method: "POST" }),
    );

    const after = await publishing();
    expect(after.hasUnpublishedChanges).toBe(false);
    expect(after.lastPublishAt).toBe(response.body.data.at);
    expect(after.history).toHaveLength(1);
  });

  it("refuses a second publish within a minute", async () => {
    stubHook();
    await as("post", "/api/admin/publish").expect(200);
    const again = await as("post", "/api/admin/publish");
    expect(again.status).toBe(429);
  });

  it("records a failed hook call", async () => {
    stubHook(500, {});
    const response = await as("post", "/api/admin/publish");
    expect(response.status).toBe(502);
    expect(response.body.error).toMatch(/Vercel answered 500/);
    const { history, lastPublishAt } = await publishing();
    expect(history[0]).toMatchObject({ ok: false });
    expect(lastPublishAt).toBeNull();
    // A failure doesn't count toward the one-minute wait.
    stubHook();
    await as("post", "/api/admin/publish").expect(200);
  });

  it("won't publish invalid content", async () => {
    const db = await getDb();
    await db
      .collection(COLLECTIONS.projects)
      .updateOne({ slug: "sarabo" }, { $set: { title: "" } });
    const hook = stubHook();
    const response = await as("post", "/api/admin/publish");
    expect(response.status).toBe(400);
    expect(response.body.issues[0].path).toBe("projects.0.title");
    expect(hook).not.toHaveBeenCalled();
  });
});
