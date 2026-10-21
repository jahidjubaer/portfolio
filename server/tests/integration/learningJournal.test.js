import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { closeDb, getDb } from "../../src/db/client.js";
import { seedDatabase } from "../../src/db/seed.js";
import { createSessionToken } from "../../src/auth/session.js";
import { getContentSnapshot } from "../../src/services/contentService.js";
import { buildDigest } from "../../src/services/askService.js";
import { contentSchema } from "../../src/schemas/content.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const original = { ...env };
let mongo;
let cookie;

const PRIVATE_TRACK = {
  id: "secret-track",
  order: 99,
  title: "Secret track",
  status: "learning",
  visibility: "private",
  resources: [],
  certificationIds: [],
  projectSlugs: [],
  notes: [],
};

function entry(id, overrides) {
  return {
    id,
    order: 0,
    date: "2026-10-20",
    trackId: "react-frontend",
    body: `Notes for ${id}.`,
    ...overrides,
  };
}

function seedContent() {
  const content = buildSeedContent();
  const [react] = content.learningTracks;
  react.syllabus = [
    { title: "Rendering", status: "done", date: "2026-10-01" },
    { title: "Hooks", status: "doing" },
    { title: "Suspense", status: "todo" },
  ];
  content.learningTracks.push(PRIVATE_TRACK);
  content.studyLog = [
    entry("log-public", { minutes: 45, topic: "Hooks" }),
    entry("log-private", { visibility: "private", body: "Private notes." }),
    entry("log-on-private-track", { trackId: "secret-track" }),
  ];
  return content;
}

function as(method, path) {
  return request(app)[method](path).set("Origin", ORIGIN).set("Cookie", cookie);
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-journal-test",
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
  await seedDatabase(db, seedContent());
});

afterAll(async () => {
  await closeDb();
  await mongo?.stop();
  Object.assign(env, original);
});

describe("learning journal", () => {
  it("never exports private tracks or entries to the public snapshot", async () => {
    const snapshot = await getContentSnapshot();
    // What export-content.js writes to client/src/generated/content.json.
    const content = { ...snapshot };
    delete content.github;
    delete content.coding;
    const exported = JSON.stringify(contentSchema.parse(content));
    expect(exported).not.toContain("secret-track");
    expect(exported).not.toContain("Private notes.");
    expect(exported).not.toContain("log-on-private-track");
    expect(snapshot.studyLog.map((item) => item.id)).toEqual(["log-public"]);
    expect(
      snapshot.learningTracks.find((track) => track.id === "react-frontend")
        .syllabus,
    ).toHaveLength(3);
    // Ask is built from the same public snapshot.
    const digest = JSON.stringify(buildDigest(snapshot));
    expect(digest).not.toContain("Private notes.");
    expect(digest).toContain("Topics: 1 of 3 done; now on Hooks.");
    expect(digest).toContain("Studied on 2026-10-20 (Hooks)");
  });

  it("shows everything to the admin", async () => {
    const response = await as("get", "/api/admin/content");
    expect(response.status).toBe(200);
    expect(response.body.data.studyLog).toHaveLength(3);
    expect(
      response.body.data.learningTracks.map((track) => track.id),
    ).toContain("secret-track");
  });

  it("adds an entry, and rejects one on a missing track", async () => {
    const created = await as("post", "/api/admin/lists/studyLog").send(
      entry("log-new", { minutes: 30 }),
    );
    expect(created.status).toBe(201);

    const broken = await as("post", "/api/admin/lists/studyLog").send(
      entry("log-broken", { trackId: "nope" }),
    );
    expect(broken.status).toBe(400);
    expect(broken.body.issues).toEqual([
      expect.objectContaining({ path: "trackId" }),
    ]);
  });

  it("won't delete a track that still has entries", async () => {
    const response = await as(
      "delete",
      "/api/admin/lists/learningTracks/secret-track",
    );
    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/studyLog/);
  });
});
