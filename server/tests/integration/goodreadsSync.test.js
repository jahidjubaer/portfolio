import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { closeDb, getDb } from "../../src/db/client.js";
import { createSessionToken } from "../../src/auth/session.js";
import {
  getBooksSnapshot,
  syncBooks,
} from "../../src/services/goodreadsService.js";

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const original = { ...env };
let mongo;
let cookie;

function book(bookId, shelf, extra = {}) {
  return {
    bookId,
    shelf,
    title: `Book ${bookId}`,
    author: "Author",
    url: `https://www.goodreads.com/book/show/${bookId}`,
    coverSource: `https://img/${bookId}.jpg`,
    pages: 100,
    published: null,
    rating: null,
    readAt: null,
    addedAt: "2025-08-14",
    tags: [],
    favorite: false,
    ...extra,
  };
}

/** A fake Goodreads: shelves as given, or an Error to throw. */
function fakeDeps(shelves) {
  const copied = [];
  return {
    copied,
    fetchShelf: async (_userId, shelf) => {
      if (shelves[shelf] instanceof Error) throw shelves[shelf];
      return shelves[shelf] ?? [];
    },
    copyCover: async (item) => {
      copied.push(item.bookId);
      return { url: `https://blob/${item.bookId}.jpg` };
    },
  };
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-books-test",
    clientOrigin: ORIGIN,
    githubClientId: "id",
    githubClientSecret: "secret",
    sessionSecret: "s".repeat(40),
    adminGithubId: ADMIN.id,
  });
  cookie = `admin_session=${await createSessionToken(ADMIN)}`;
}, 120_000);

beforeEach(async () => {
  await (await getDb()).dropDatabase();
});

afterAll(async () => {
  await closeDb();
  await mongo?.stop();
  Object.assign(env, original);
});

describe("Goodreads sync", () => {
  it("has no books before the first sync", async () => {
    expect(await getBooksSnapshot()).toBeNull();
  });

  it("stores both shelves, newest read first, covers copied once", async () => {
    const deps = fakeDeps({
      "currently-reading": [book("1", "currently-reading")],
      read: [
        book("2", "read", { readAt: "2025-01-01" }),
        book("3", "read", { readAt: "2026-05-19" }),
        book("4", "read"),
      ],
    });
    await syncBooks("42", deps);
    const snapshot = await getBooksSnapshot();
    expect(snapshot.profileUrl).toBe("https://www.goodreads.com/user/show/42");
    expect(snapshot.currentlyReading.map((item) => item.bookId)).toEqual(["1"]);
    expect(snapshot.read.map((item) => item.bookId)).toEqual(["3", "2", "4"]);
    expect(snapshot.read[0]).not.toHaveProperty("coverSource");
    expect(snapshot.read[0].cover).toEqual({ url: "https://blob/3.jpg" });

    await syncBooks("42", deps);
    expect(deps.copied).toHaveLength(4);
  });

  it("keeps a failed shelf's books, and a hidden book stays hidden when it moves", async () => {
    await syncBooks(
      "42",
      fakeDeps({
        "currently-reading": [book("1", "currently-reading")],
        read: [book("2", "read")],
      }),
    );
    const response = await request(app)
      .patch("/api/admin/books/1")
      .set("Origin", ORIGIN)
      .set("Cookie", cookie)
      .send({ hidden: true });
    expect(response.status).toBe(200);
    expect((await getBooksSnapshot()).currentlyReading).toEqual([]);

    // Book 1 finished: it moves to "read"; book 2 was removed on Goodreads.
    await syncBooks(
      "42",
      fakeDeps({ "currently-reading": [], read: [book("1", "read")] }),
    );
    const db = await getDb();
    const stored = await db.collection("books").find().toArray();
    expect(
      stored.map((item) => [item.bookId, item.shelf, item.hidden]),
    ).toEqual([["1", "read", true]]);

    // Goodreads down for "read": its books stay.
    const result = await syncBooks(
      "42",
      fakeDeps({
        "currently-reading": [],
        read: new Error("Goodreads answered 503."),
      }),
    );
    expect(result.errors).toEqual({ read: "Goodreads answered 503." });
    expect(await db.collection("books").countDocuments()).toBe(1);
  });

  it("asks for a Goodreads id before syncing from the admin", async () => {
    const response = await request(app)
      .post("/api/admin/books/sync")
      .set("Origin", ORIGIN)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Goodreads user ID/);
  });
});
