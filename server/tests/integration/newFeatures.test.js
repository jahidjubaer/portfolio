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

// The AI SDK is replaced, so no test ever calls a real model.
vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: ({ schema }) => ({ schema }) },
}));

const { generateText } = await import("ai");
const { app } = await import("../../src/app.js");
const { env } = await import("../../src/config/env.js");
const { closeDb, getDb } = await import("../../src/db/client.js");
const { seedDatabase } = await import("../../src/db/seed.js");
const { createSessionToken } = await import("../../src/auth/session.js");
const { buildSeedContent } = await import("../../scripts/seed-content.js");
const { fetchCodeforces, fetchVJudge, fetchPracticeRepo, mergeByJudge } =
  await import("../../src/services/codingStatsService.js");

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const original = { ...env };
let mongo;
let cookie;

function as(method, path) {
  return request(app)[method](path).set("Origin", ORIGIN).set("Cookie", cookie);
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Routes stubbed fetch calls by URL substring. */
function stubFetch(routes) {
  const fetchMock = vi.fn(async (url) => {
    const match = Object.entries(routes).find(([part]) =>
      String(url).includes(part),
    );
    if (!match) return json(404, { message: "Not Found" });
    const [, answer] = match;
    return typeof answer === "function" ? answer(url) : json(200, answer);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const CODEFORCES = {
  "user.info": {
    status: "OK",
    result: [
      { handle: "cf_user", rating: 782, maxRating: 790, rank: "newbie" },
    ],
  },
  "user.status": {
    status: "OK",
    result: [
      {
        verdict: "OK",
        problem: { contestId: 1, index: "A" },
        creationTimeSeconds: 1736476591,
      },
      {
        verdict: "OK",
        problem: { contestId: 1, index: "A" },
        creationTimeSeconds: 1736476000,
      },
      {
        verdict: "WRONG_ANSWER",
        problem: { contestId: 2, index: "B" },
        creationTimeSeconds: 1716741248,
      },
      {
        verdict: "OK",
        problem: { contestId: 3, index: "C" },
        creationTimeSeconds: 1716741300,
      },
    ],
  },
  "user.rating": { status: "OK", result: [{}, {}] },
};

const VJUDGE = {
  "vjudge.net/user/solveDetail": {
    acRecords: { CodeForces: ["1A", "2B"], AtCoder: ["abc1_a"], UVA: [] },
    failRecords: {},
  },
};

const PRACTICE_TREE = {
  "/repos/jahidjubaer/Programming/git/trees/HEAD": {
    tree: [
      { type: "blob", path: "Codeforces/A.cpp" },
      { type: "blob", path: "Codeforces/B.cpp" },
      { type: "blob", path: "Assiut-Training/Loops/1.cpp" },
      { type: "blob", path: "README.md" },
      { type: "blob", path: "main.cpp" },
      { type: "tree", path: "Codeforces" },
    ],
  },
  "/repos/jahidjubaer/Programming": {
    id: 9,
    name: "Programming",
    html_url: "https://github.com/jahidjubaer/Programming",
    private: false,
    created_at: "2024-10-18T05:33:17Z",
    pushed_at: "2025-07-05T17:13:18Z",
  },
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-features-test",
    clientOrigin: ORIGIN,
    githubClientId: "id",
    githubClientSecret: "secret",
    sessionSecret: "s".repeat(40),
    adminGithubId: ADMIN.id,
    githubUsername: "jahidjubaer",
  });
  cookie = `admin_session=${await createSessionToken(ADMIN)}`;
}, 120_000);

beforeEach(async () => {
  vi.unstubAllGlobals();
  generateText.mockReset();
  Object.assign(env, {
    cronSecret: "",
    deployHookUrl: "",
    geminiApiKey: "",
  });
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

describe("coding stats", () => {
  it("counts distinct accepted Codeforces problems", async () => {
    stubFetch(CODEFORCES);
    const stats = await fetchCodeforces("cf_user");
    expect(stats).toMatchObject({
      handle: "cf_user",
      rating: 782,
      maxRating: 790,
      solved: 2,
      problems: ["1A", "3C"],
      contests: 2,
      url: "https://codeforces.com/profile/cf_user",
      firstActiveAt: "2024-05-26T16:34:08.000Z",
      lastActiveAt: "2025-01-10T02:36:31.000Z",
    });
  });

  it("sums VJudge solves per judge, largest first, skipping empty ones", async () => {
    stubFetch(VJUDGE);
    expect(await fetchVJudge("me01")).toEqual({
      handle: "me01",
      url: "https://vjudge.net/user/me01",
      solved: 3,
      byJudge: [
        { judge: "CodeForces", solved: 2 },
        { judge: "AtCoder", solved: 1 },
      ],
      problemsByJudge: { CodeForces: ["1A", "2B"], AtCoder: ["abc1_a"] },
    });
  });

  it("merges solves per origin judge, counting an overlap once", () => {
    const codeforces = { solved: 3, problems: ["1A", "3C", "287306A"] };
    const vjudge = {
      byJudge: [
        { judge: "CodeForces", solved: 2 },
        { judge: "Gym", solved: 2 },
        { judge: "AtCoder", solved: 1 },
      ],
      problemsByJudge: {
        CodeForces: ["1A", "2B"],
        Gym: ["287306A", "287306B"],
        AtCoder: ["abc1_a"],
      },
    };
    expect(mergeByJudge(codeforces, vjudge)).toEqual({
      judges: [
        { judge: "CodeForces", solved: 3, direct: 2, vjudge: 2, overlap: 1 },
        // A gym problem from the account lands in Gym, not Codeforces.
        { judge: "Gym", solved: 2, direct: 1, vjudge: 2, overlap: 1 },
        { judge: "AtCoder", solved: 1, direct: 0, vjudge: 1, overlap: 0 },
      ],
      total: 6,
    });
  });

  it("falls back to the larger count when a cache has no problem ids", () => {
    const merged = mergeByJudge(
      { solved: 21 },
      { byJudge: [{ judge: "CodeForces", solved: 47 }] },
    );
    expect(merged).toEqual({
      judges: [
        {
          judge: "CodeForces",
          solved: 47,
          direct: 21,
          vjudge: 47,
          overlap: null,
        },
      ],
      total: 47,
    });
    expect(mergeByJudge(null, null)).toEqual({ judges: [], total: 0 });
  });

  it("explains a VJudge handle that doesn't exist (HTML answer)", async () => {
    stubFetch({ "vjudge.net": () => new Response("<html></html>") });
    await expect(fetchVJudge("nobody")).rejects.toThrow(/didn't recognise/);
  });

  it("counts solution files per top-level folder of the practice repo", async () => {
    stubFetch(PRACTICE_TREE);
    expect(await fetchPracticeRepo("Programming")).toEqual({
      name: "Programming",
      url: "https://github.com/jahidjubaer/Programming",
      createdAt: "2024-10-18T05:33:17Z",
      pushedAt: "2025-07-05T17:13:18Z",
      files: 4,
      folders: [
        { folder: "Codeforces", files: 2 },
        { folder: "Assiut Training", files: 1 },
        { folder: "Other", files: 1 },
      ],
    });
  });

  it("syncs from the admin and keeps a failed source's last value", async () => {
    const db = await getDb();
    await db.collection("profile").updateOne(
      { _id: "main" },
      {
        $set: {
          "problemSolving.codeforcesHandle": "cf_user",
          "problemSolving.vjudgeHandle": "me01",
          "problemSolving.practiceRepo": "Programming",
        },
      },
    );
    stubFetch({ ...CODEFORCES, ...VJUDGE, ...PRACTICE_TREE });
    const first = await as("post", "/api/admin/coding/sync").expect(200);
    expect(first.body.data.codeforces.solved).toBe(2);
    expect(first.body.data.vjudge.solved).toBe(3);
    expect(first.body.data.practice.files).toBe(4);

    // Codeforces down: its old numbers stay, the error is recorded.
    stubFetch({
      "codeforces.com": () => json(503, {}),
      ...VJUDGE,
      ...PRACTICE_TREE,
    });
    const second = await as("post", "/api/admin/coding/sync").expect(200);
    expect(second.body.data.codeforces.solved).toBe(2);
    expect(second.body.data.errors.codeforces).toMatch(
      /Codeforces answered 503/,
    );

    expect(second.body.data.total).toBe(4);

    const snapshot = await request(app).get("/api/public/content").expect(200);
    const { coding } = snapshot.body.data;
    expect(coding.codeforces.rating).toBe(782);
    expect(coding).not.toHaveProperty("errors");
    // Merged per judge; the raw ids stay in the admin.
    expect(coding.total).toBe(4);
    expect(coding.judges[0]).toMatchObject({
      judge: "CodeForces",
      solved: 3,
      overlap: 1,
    });
    expect(coding.codeforces).not.toHaveProperty("problems");
    expect(coding.vjudge).not.toHaveProperty("problemsByJudge");
  });

  it("is null in the snapshot before any sync", async () => {
    const snapshot = await request(app).get("/api/public/content").expect(200);
    expect(snapshot.body.data.coding).toBeNull();
  });
});

describe("contact inbox", () => {
  const MESSAGE = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Job opportunity",
    message: "Hello Jahid, we'd like to talk.",
  };

  it("stores a valid message from the site", async () => {
    await request(app)
      .post("/api/contact")
      .set("Origin", ORIGIN)
      .send(MESSAGE)
      .expect(201);
    const content = await as("get", "/api/admin/content").expect(200);
    expect(content.body.data.messages).toEqual([
      expect.objectContaining({ ...MESSAGE, read: false, archived: false }),
    ]);
  });

  it("rejects other sites and invalid input", async () => {
    await request(app)
      .post("/api/contact")
      .set("Origin", "https://evil.example")
      .send(MESSAGE)
      .expect(403);
    const invalid = await request(app)
      .post("/api/contact")
      .set("Origin", ORIGIN)
      .send({ ...MESSAGE, email: "nope" })
      .expect(400);
    expect(invalid.body.issues[0].path).toBe("email");
  });

  it("drops honeypot submissions silently", async () => {
    await request(app)
      .post("/api/contact")
      .set("Origin", ORIGIN)
      .send({ ...MESSAGE, companyWebsite: "spam.example" })
      .expect(201);
    const db = await getDb();
    expect(await db.collection("messages").countDocuments()).toBe(0);
  });

  it("lets the admin mark, archive, and delete messages", async () => {
    await request(app).post("/api/contact").set("Origin", ORIGIN).send(MESSAGE);
    const content = await as("get", "/api/admin/content");
    const { id } = content.body.data.messages[0];

    const marked = await as("patch", `/api/admin/messages/${id}`)
      .send({ read: true, archived: true })
      .expect(200);
    expect(marked.body.data).toMatchObject({ read: true, archived: true });
    await as("patch", `/api/admin/messages/${id}`)
      .send({ subject: "edited" })
      .expect(400);
    await as("delete", `/api/admin/messages/${id}`).expect(200);
    await as("delete", `/api/admin/messages/${id}`).expect(404);
  });

  it("is admin-only", async () => {
    await request(app)
      .patch("/api/admin/messages/x")
      .set("Origin", ORIGIN)
      .send({ read: true })
      .expect(401);
  });
});

describe("AI drafts", () => {
  const REPO_ROUTES = {
    "/repos/jahidjubaer/sarabo/git/trees/HEAD": {
      tree: [{ type: "blob", path: "package.json" }],
    },
    "/repos/jahidjubaer/sarabo/contents/package.json": {
      content: Buffer.from('{"dependencies":{"react":"19"}}').toString(
        "base64",
      ),
    },
    "/repos/jahidjubaer/sarabo/readme": {
      content: Buffer.from("# Sarabo\nService booking.").toString("base64"),
    },
    "/repos/jahidjubaer/sarabo/languages": { JavaScript: 1000 },
    "/repos/jahidjubaer/sarabo/commits": [
      { commit: { message: "feat: booking\n\nbody" } },
    ],
    "/repos/jahidjubaer/sarabo": {
      id: 1,
      name: "sarabo",
      html_url: "https://github.com/jahidjubaer/sarabo",
      description: "Booking app",
      topics: [],
      private: false,
      created_at: "2025-03-02T00:00:00Z",
      pushed_at: "2025-06-01T00:00:00Z",
    },
  };

  // Listed first: stubFetch matches by substring, and "sarabo" is a
  // prefix of "sarabo-server".
  const SERVER_ROUTES = {
    "/repos/jahidjubaer/sarabo-server/git/trees/HEAD": { tree: [] },
    "/repos/jahidjubaer/sarabo-server/readme": {
      content: Buffer.from("# API").toString("base64"),
    },
    "/repos/jahidjubaer/sarabo-server/languages": { JavaScript: 10 },
    "/repos/jahidjubaer/sarabo-server/commits": [],
    "/repos/jahidjubaer/sarabo-server": {
      id: 2,
      name: "sarabo-server",
      html_url: "https://github.com/jahidjubaer/sarabo-server",
      description: "Booking API",
      topics: [],
      private: false,
      created_at: "2025-03-02T00:00:00Z",
      pushed_at: "2025-06-01T00:00:00Z",
    },
  };

  it("answers 503 until Gemini is configured", async () => {
    const fetchMock = stubFetch(REPO_ROUTES);
    await as("post", "/api/admin/ai/project-draft")
      .send({ repo: "sarabo" })
      .expect(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("drafts project fields from the repo without saving anything", async () => {
    env.geminiApiKey = "test-key";
    stubFetch(REPO_ROUTES);
    generateText.mockResolvedValue({
      output: {
        title: "Sarabo booking",
        summary: "A service booking app.",
        projectType: "Full-stack web app",
        stack: ["React"],
        capabilities: ["Booking"],
        caseStudy: {
          problem: "",
          whatIBuilt: "Booking flow.",
          howItWorks: "",
          hardPart: "",
          result: "",
        },
        seoTitle: "Sarabo",
        seoDescription: "Booking app.",
        missingContent: ["Add screenshots"],
      },
    });
    const response = await as("post", "/api/admin/ai/project-draft")
      .send({ repo: "sarabo" })
      .expect(200);
    expect(response.body.data).toMatchObject({
      title: "Sarabo booking",
      stack: ["React"],
      seo: { title: "Sarabo", description: "Booking app." },
      caseStudy: {
        sections: [
          { id: "problem", heading: "Problem", body: "" },
          {
            id: "what-i-built",
            heading: "What I built",
            type: "text",
            body: "Booking flow.",
          },
          { id: "how-it-works", body: "" },
          { id: "hard-part", body: "" },
          { id: "result", heading: "Result and next", body: "" },
        ],
      },
    });
    const { prompt, instructions } = generateText.mock.calls[0][0];
    expect(prompt).toContain("Service booking.");
    expect(prompt).toContain('"react":"19"');
    expect(prompt).toContain("feat: booking");
    expect(prompt).not.toContain("body");
    expect(instructions).toMatch(/Never invent/);

    const db = await getDb();
    expect(
      await db.collection("projects").findOne({ title: "Sarabo booking" }),
    ).toBe(null);
  });

  it("drafts a learning track, with the start month from the repo", async () => {
    env.geminiApiKey = "test-key";
    stubFetch(REPO_ROUTES);
    generateText.mockResolvedValue({
      output: {
        title: "React",
        summary: "Components.",
        practice: "Projects.",
        status: "learning",
        missingContent: [],
      },
    });
    const response = await as("post", "/api/admin/ai/learning-draft")
      .send({ repo: "sarabo" })
      .expect(200);
    expect(response.body.data).toMatchObject({
      title: "React",
      since: "2025-03",
      repos: ["sarabo"],
    });
  });

  it("reads every repo of a project in one prompt", async () => {
    env.geminiApiKey = "test-key";
    stubFetch({ ...SERVER_ROUTES, ...REPO_ROUTES });
    generateText.mockResolvedValue({
      output: {
        title: "Sarabo",
        summary: "A booking app.",
        projectType: "Full-stack web app",
        stack: ["React", "Express"],
        capabilities: ["Booking"],
        caseStudy: {},
        seoTitle: "Sarabo",
        seoDescription: "Booking app.",
        missingContent: [],
      },
    });
    await as("post", "/api/admin/ai/project-draft")
      .send({ repos: ["sarabo", "sarabo", "sarabo-server"] })
      .expect(200);
    const { prompt } = generateText.mock.calls[0][0];
    expect(prompt).toMatch(
      /split across 2 repositories \(sarabo, sarabo-server\)/,
    );
    expect(prompt).toContain("Repository 2 of 2");

    await as("post", "/api/admin/ai/project-draft")
      .send({ repos: ["a", "b", "c", "d", "e"] })
      .expect(400);
    await as("post", "/api/admin/ai/project-draft")
      .send({ repos: [] })
      .expect(400);
  });

  it("rejects a bad repo name and reports a busy model", async () => {
    env.geminiApiKey = "test-key";
    await as("post", "/api/admin/ai/project-draft")
      .send({ repo: "../etc" })
      .expect(400);
    stubFetch(REPO_ROUTES);
    generateText.mockRejectedValue(
      Object.assign(new Error("rate"), { statusCode: 429 }),
    );
    const busy = await as("post", "/api/admin/ai/project-draft")
      .send({ repo: "sarabo" })
      .expect(429);
    expect(busy.body.error).toMatch(/daily limit/);
  });
});

describe("changes since last publish", () => {
  it("lists each edited item once, until the next publish", async () => {
    const content = await as("get", "/api/admin/content");
    const project = content.body.data.projects[0];
    await as("put", `/api/admin/lists/projects/${project.slug}`)
      .send({ ...project, summary: "Edited once." })
      .expect(200);
    await as("put", `/api/admin/lists/projects/${project.slug}`)
      .send({ ...project, summary: "Edited twice." })
      .expect(200);
    await as("put", "/api/admin/singletons/beyond")
      .send(content.body.data.beyond)
      .expect(200);

    const after = await as("get", "/api/admin/content");
    expect(after.body.data.publishing.changes).toEqual([
      expect.objectContaining({ collection: "beyond", action: "updated" }),
      expect.objectContaining({
        collection: "projects",
        key: project.slug,
        label: project.title,
        action: "updated",
        count: 2,
      }),
    ]);

    env.deployHookUrl = "https://api.vercel.com/v1/integrations/deploy/x";
    stubFetch({ "api.vercel.com": { job: { id: "job1" } } });
    await as("post", "/api/admin/publish").expect(200);
    const published = await as("get", "/api/admin/content");
    expect(published.body.data.publishing.changes).toEqual([]);
  });
});

describe("daily sync", () => {
  it("republishes when synced numbers changed, and not when they didn't", async () => {
    env.cronSecret = "c".repeat(32);
    env.deployHookUrl = "https://api.vercel.com/v1/integrations/deploy/x";
    const db = await getDb();
    await db
      .collection("profile")
      .updateOne(
        { _id: "main" },
        { $set: { "problemSolving.vjudgeHandle": "me01" } },
      );
    const fetchMock = stubFetch({
      "api.vercel.com": { job: { id: "job1" } },
      "api.github.com/users/": () => json(200, []),
      ...VJUDGE,
    });
    const cron = () =>
      request(app)
        .get("/api/cron/github-sync")
        .set("Authorization", `Bearer ${"c".repeat(32)}`)
        .expect(200);

    const first = await cron();
    expect(first.body.data.published).toBe(true);

    // Same numbers a minute later: no rebuild.
    await db
      .collection("publishLog")
      .updateMany({}, { $set: { at: "2020-01-01T00:00:00.000Z" } });
    const second = await cron();
    expect(second.body.data.published).toBe(false);
    const hookCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("api.vercel.com"),
    );
    expect(hookCalls).toHaveLength(1);
  });

  it("doesn't republish when the setting is off", async () => {
    env.cronSecret = "c".repeat(32);
    env.deployHookUrl = "https://api.vercel.com/v1/integrations/deploy/x";
    const db = await getDb();
    await db
      .collection("settings")
      .updateOne(
        { _id: "main" },
        { $set: { autoPublishAfterSync: false } },
        { upsert: true },
      );
    stubFetch({
      "api.vercel.com": { job: { id: "job1" } },
      "api.github.com/users/": () => json(200, []),
    });
    const response = await request(app)
      .get("/api/cron/github-sync")
      .set("Authorization", `Bearer ${"c".repeat(32)}`)
      .expect(200);
    expect(response.body.data.published).toBe(false);
  });
});

describe("hidden projects", () => {
  it("stay in the admin but out of the public snapshot and project API", async () => {
    const db = await getDb();
    const [first, second] = await db
      .collection("projects")
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray();
    await as("put", `/api/admin/lists/projects/${second.slug}`)
      .send({ ...second, relatedSlugs: [first.slug] })
      .expect(200);
    await as("put", `/api/admin/lists/projects/${first.slug}`)
      .send({ ...first, hidden: true, relatedSlugs: [] })
      .expect(200);

    const admin = await as("get", "/api/admin/content").expect(200);
    expect(
      admin.body.data.projects.find((p) => p.slug === first.slug).hidden,
    ).toBe(true);

    const snapshot = await request(app).get("/api/public/content").expect(200);
    const slugs = snapshot.body.data.projects.map((p) => p.slug);
    expect(slugs).not.toContain(first.slug);
    // References to it are dropped, so the public snapshot stays valid.
    expect(
      snapshot.body.data.projects.find((p) => p.slug === second.slug)
        .relatedSlugs,
    ).toEqual([]);
    await request(app).get(`/api/public/projects/${first.slug}`).expect(404);
    const list = await request(app).get("/api/public/projects").expect(200);
    expect(list.body.data.map((p) => p.slug)).not.toContain(first.slug);

    // Unhiding publishes it again.
    await as("put", `/api/admin/lists/projects/${first.slug}`)
      .send({ ...first, relatedSlugs: [] })
      .expect(200);
    const after = await request(app).get("/api/public/content").expect(200);
    expect(after.body.data.projects.map((p) => p.slug)).toContain(first.slug);
  });

  it("drafts the portfolio import as a valid hidden project", async () => {
    const { PORTFOLIO_PROJECT } =
      await import("../../scripts/portfolio-project.js");
    const { projectSchema } = await import("../../src/schemas/content.js");
    expect(PORTFOLIO_PROJECT.hidden).toBe(true);
    expect(() =>
      projectSchema.parse({ ...PORTFOLIO_PROJECT, order: 0 }),
    ).not.toThrow();
  });
});
