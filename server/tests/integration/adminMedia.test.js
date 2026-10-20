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
import { getPayloadFromClientToken } from "@vercel/blob/client";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { closeDb, getDb } from "../../src/db/client.js";
import { seedDatabase } from "../../src/db/seed.js";
import { createSessionToken } from "../../src/auth/session.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

const del = vi.hoisted(() => vi.fn());
vi.mock("@vercel/blob", () => ({ del }));

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const BLOB_TOKEN = "vercel_blob_rw_teststore123_secretsecretsecret";
const IMAGE_URL =
  "https://teststore123.public.blob.vercel-storage.com/photos/dusk-x1.webp";
const original = { ...env };
let mongo;
let cookie;

function as(method, path) {
  return request(app)[method](path).set("Origin", ORIGIN).set("Cookie", cookie);
}

const photo = {
  id: "dusk",
  image: { url: IMAGE_URL, width: 1600, height: 1067 },
  alt: "Cricket ground at dusk",
  album: "Cricket",
};

const draft = {
  slug: "draft-post",
  title: "Draft post",
  excerpt: "Not ready yet.",
  body: "Work in progress.",
  tags: [],
  status: "draft",
};

const published = {
  ...draft,
  slug: "published-post",
  title: "Published post",
  status: "published",
  publishedAt: "2026-10-19",
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-media-test",
    clientOrigin: ORIGIN,
    githubClientId: "id",
    githubClientSecret: "secret",
    sessionSecret: "s".repeat(40),
    adminGithubId: ADMIN.id,
  });
  cookie = `admin_session=${await createSessionToken(ADMIN)}`;
}, 120_000);

beforeEach(async () => {
  del.mockReset();
  env.blobToken = BLOB_TOKEN;
  const db = await getDb();
  await db.dropDatabase();
  // These tests add their own photos and posts; start from none (the
  // seed copies the published ones from the snapshot).
  await seedDatabase(db, { ...buildSeedContent(), photos: [], posts: [] });
});

afterAll(async () => {
  await closeDb();
  await mongo?.stop();
  Object.assign(env, original);
});

describe("posts", () => {
  it("keeps drafts out of the public API", async () => {
    await as("post", "/api/admin/lists/posts").send(draft).expect(201);
    await as("post", "/api/admin/lists/posts").send(published).expect(201);

    const list = await request(app).get("/api/public/posts");
    expect(list.body.data.map((post) => post.slug)).toEqual(["published-post"]);
    await request(app).get("/api/public/posts/draft-post").expect(404);
    const one = await request(app).get("/api/public/posts/published-post");
    expect(one.body.data.title).toBe("Published post");

    const snapshot = await request(app).get("/api/public/content");
    expect(snapshot.body.data.posts).toHaveLength(1);
    const admin = await as("get", "/api/admin/content");
    expect(admin.body.data.posts).toHaveLength(2);
  });

  it("refuses to publish without a date", async () => {
    const response = await as("post", "/api/admin/lists/posts").send({
      ...draft,
      status: "published",
    });
    expect(response.status).toBe(400);
    expect(response.body.issues).toEqual([
      expect.objectContaining({ path: "publishedAt" }),
    ]);
  });
});

describe("photos", () => {
  it("adds photos in order and deletes the uploaded file with them", async () => {
    await as("post", "/api/admin/lists/photos").send(photo).expect(201);
    const second = await as("post", "/api/admin/lists/photos").send({
      ...photo,
      id: "nets",
    });
    expect(second.body.data.order).toBe(1);

    const list = await request(app).get("/api/public/photos");
    expect(list.body.data.map((item) => item.id)).toEqual(["dusk", "nets"]);

    await as("delete", "/api/admin/lists/photos/dusk").expect(200);
    expect(del).toHaveBeenCalledWith(IMAGE_URL, { token: BLOB_TOKEN });
  });

  it("still deletes the photo when the file can't be removed", async () => {
    del.mockRejectedValueOnce(new Error("Blob is down"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await as("post", "/api/admin/lists/photos").send(photo).expect(201);
    await as("delete", "/api/admin/lists/photos/dusk").expect(200);
    const list = await request(app).get("/api/public/photos");
    expect(list.body.data).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("rejects images that weren't uploaded to the store", async () => {
    const response = await as("post", "/api/admin/lists/photos").send({
      ...photo,
      image: { ...photo.image, url: "https://example.com/a.jpg" },
    });
    expect(response.status).toBe(400);
    expect(response.body.issues[0].path).toBe("image.url");
  });
});

describe("POST /api/admin/uploads", () => {
  it("requires sign-in", async () => {
    await request(app)
      .post("/api/admin/uploads")
      .set("Origin", ORIGIN)
      .send({ kind: "photo", filename: "a.jpg", contentType: "image/jpeg" })
      .expect(401);
  });

  it("issues a one-file token for a server-chosen path", async () => {
    const response = await as("post", "/api/admin/uploads").send({
      kind: "photo",
      filename: "My Photo (1).JPG",
      contentType: "image/webp",
    });
    expect(response.status).toBe(200);
    const { token, pathname } = response.body.data;
    expect(pathname).toBe("photos/my-photo-1.webp");
    expect(token).toMatch(/^vercel_blob_client_teststore123_/);
    expect(getPayloadFromClientToken(token)).toMatchObject({
      pathname,
      allowedContentTypes: ["image/webp"],
      maximumSizeInBytes: 8 * 1024 * 1024,
      addRandomSuffix: true,
    });
  });

  it("only allows PDFs for the resume", async () => {
    const pdf = await as("post", "/api/admin/uploads").send({
      kind: "resume",
      filename: "Jahid Hasan Resume.pdf",
      contentType: "application/pdf",
    });
    expect(pdf.body.data.pathname).toBe("resume/jahid-hasan-resume.pdf");

    const image = await as("post", "/api/admin/uploads").send({
      kind: "resume",
      filename: "resume.png",
      contentType: "image/png",
    });
    expect(image.status).toBe(400);
  });

  it("rejects unknown kinds", async () => {
    const response = await as("post", "/api/admin/uploads").send({
      kind: "__proto__",
      filename: "x.png",
      contentType: "image/png",
    });
    expect(response.status).toBe(400);
  });

  it("answers 503 until a Blob store is connected", async () => {
    env.blobToken = "";
    const response = await as("post", "/api/admin/uploads").send({
      kind: "photo",
      filename: "a.jpg",
      contentType: "image/jpeg",
    });
    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/Uploads aren't configured/);
  });
});
