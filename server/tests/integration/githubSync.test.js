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
import { seedDatabase } from "../../src/db/seed.js";
import { createSessionToken } from "../../src/auth/session.js";
import { repoNameFromUrl } from "../../src/services/githubSyncService.js";
import { buildSeedContent } from "../../scripts/seed-content.js";

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const original = { ...env };
let mongo;
let cookie;

function as(method, path) {
  return request(app)[method](path).set("Origin", ORIGIN).set("Cookie", cookie);
}

function rawRepo(id, name, extra = {}) {
  return {
    id,
    name,
    html_url: `https://github.com/jahidjubaer/${name}`,
    description: `${name} description`,
    language: "JavaScript",
    topics: ["react"],
    homepage: "",
    stargazers_count: 2,
    fork: false,
    archived: false,
    private: false,
    pushed_at: `2026-10-${String(30 - id).padStart(2, "0")}T10:00:00Z`,
    ...extra,
  };
}

const REPOS = [
  rawRepo(1, "sarabo-client", { homepage: "https://sarabo-jahid.web.app" }),
  rawRepo(2, "sarabo-server"),
  rawRepo(3, "hsc-ict-creck-client"),
  rawRepo(4, "forked-lib", { fork: true }),
  rawRepo(5, "old-thing", { archived: true }),
  rawRepo(6, "jahid-capture-server", { language: null }),
];

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

/** Stubs GitHub's API with one page per array in `pages`. */
function stubGitHub(...pages) {
  const fetchMock = vi.fn(async (url) => {
    const page = Number(new URL(url).searchParams.get("page"));
    return json(200, pages[page - 1] ?? []);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(env, {
    mongodbUri: mongo.getUri(),
    mongodbDb: "portfolio-github-test",
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
  env.githubToken = "";
  env.cronSecret = "";
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

describe("repoNameFromUrl", () => {
  it("only recognises the synced account's repositories", () => {
    expect(
      repoNameFromUrl("https://github.com/jahidjubaer/Sarabo-Client"),
    ).toBe("sarabo-client");
    expect(repoNameFromUrl("https://github.com/JahidJubaer/x.git")).toBe("x");
    expect(repoNameFromUrl("https://github.com/someone-else/x")).toBeNull();
    expect(repoNameFromUrl("https://github.com/jahidjubaer")).toBeNull();
    expect(repoNameFromUrl("https://gitlab.com/jahidjubaer/x")).toBeNull();
    expect(repoNameFromUrl(null)).toBeNull();
  });
});

describe("POST /api/admin/github/sync", () => {
  it("requires sign-in", async () => {
    await request(app)
      .post("/api/admin/github/sync")
      .set("Origin", ORIGIN)
      .expect(401);
  });

  it("caches every page of public repos and links them to projects", async () => {
    const fetchMock = stubGitHub(
      [
        ...REPOS,
        ...Array.from({ length: 94 }, (_, i) => rawRepo(100 + i, `r${i}`)),
      ],
      [rawRepo(500, "page-two")],
    );
    const response = await as("post", "/api/admin/github/sync");
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ repoCount: 101 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/users/jahidjubaer/repos?type=owner&sort=pushed&per_page=100&page=1",
    );
    expect(init.headers).not.toHaveProperty("Authorization");

    const { body } = await as("get", "/api/admin/content");
    const { repositories } = body.data;
    expect(repositories.sync).toMatchObject({ repoCount: 101, error: null });
    expect(repositories.tokenConfigured).toBe(false);
    const client = repositories.repos.find((r) => r.name === "sarabo-client");
    expect(client).toMatchObject({
      language: "JavaScript",
      homepage: "https://sarabo-jahid.web.app",
      stars: 2,
      projects: ["sarabo"],
    });
    expect(client).not.toHaveProperty("_id");
    // hsc-ict-creck-server isn't on GitHub (in this fake answer).
    expect(repositories.warnings).toEqual([
      expect.objectContaining({
        project: "ict-crack",
        url: "https://github.com/jahidjubaer/hsc-ict-creck-server",
      }),
    ]);
  });

  it("drops repos that were deleted or made private", async () => {
    stubGitHub(REPOS);
    await as("post", "/api/admin/github/sync").expect(200);
    stubGitHub([
      ...REPOS.filter((repo) => repo.name !== "sarabo-server"),
      rawRepo(7, "secret", { private: true }),
    ]);
    await as("post", "/api/admin/github/sync").expect(200);

    const { body } = await as("get", "/api/admin/content");
    const names = body.data.repositories.repos.map((repo) => repo.name);
    expect(names).not.toContain("sarabo-server");
    expect(names).not.toContain("secret");
    expect(body.data.repositories.warnings.map((w) => w.url)).toContain(
      "https://github.com/jahidjubaer/sarabo-server",
    );
  });

  it("sends the token when one is configured", async () => {
    env.githubToken = "github_pat_test";
    const fetchMock = stubGitHub(REPOS);
    await as("post", "/api/admin/github/sync").expect(200);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer github_pat_test",
    );
  });

  it("explains a rate limit and keeps the old cache", async () => {
    stubGitHub(REPOS);
    await as("post", "/api/admin/github/sync").expect(200);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        json(
          403,
          { message: "API rate limit exceeded" },
          { "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1792404000" },
        ),
      ),
    );

    const response = await as("post", "/api/admin/github/sync");
    expect(response.status).toBe(503);
    expect(response.body.error).toBe(
      "GitHub's rate limit is used up. Try again after 10:00 UTC.",
    );
    const { body } = await as("get", "/api/admin/content");
    expect(body.data.repositories.repos).toHaveLength(REPOS.length);
    expect(body.data.repositories.sync.error).toMatch(/rate limit/);
  });

  it("handles secondary rate limits and a rejected token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json(429, {}, { "retry-after": "120" })),
    );
    const limited = await as("post", "/api/admin/github/sync");
    expect(limited.status).toBe(503);
    expect(limited.body.error).toMatch(/Try again in 2 min/);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json(401, {})),
    );
    const rejected = await as("post", "/api/admin/github/sync");
    expect(rejected.status).toBe(502);
    expect(rejected.body.error).toMatch(/GITHUB_TOKEN/);
  });

  it("doesn't warn about links before the first sync", async () => {
    const { body } = await as("get", "/api/admin/content");
    expect(body.data.repositories).toMatchObject({
      sync: null,
      repos: [],
      warnings: [],
    });
  });
});

describe("public snapshot", () => {
  it("has no GitHub data until the first sync", async () => {
    const response = await request(app).get("/api/public/content");
    expect(response.body.data.github).toBeNull();
  });

  it("lists recent own repos and stats for linked repos", async () => {
    stubGitHub(REPOS);
    await as("post", "/api/admin/github/sync").expect(200);

    const { body } = await request(app).get("/api/public/content");
    const { github } = body.data;
    expect(github.publicRepos).toBe(REPOS.length);
    // Forks and archived repos stay out of "Recently on GitHub".
    expect(github.recentRepos.map((repo) => repo.name)).toEqual([
      "sarabo-client",
      "sarabo-server",
      "hsc-ict-creck-client",
    ]);
    expect(Object.keys(github.repos).sort()).toEqual([
      "hsc-ict-creck-client",
      "sarabo-client",
      "sarabo-server",
    ]);
    expect(github.repos["sarabo-client"]).toEqual({
      name: "sarabo-client",
      url: "https://github.com/jahidjubaer/sarabo-client",
      description: "sarabo-client description",
      language: "JavaScript",
      stars: 2,
      homepage: "https://sarabo-jahid.web.app",
      pushedAt: "2026-10-29T10:00:00Z",
    });
  });
});

describe("GET /api/cron/github-sync", () => {
  it("is off until CRON_SECRET is set", async () => {
    await request(app).get("/api/cron/github-sync").expect(503);
  });

  it("needs the secret", async () => {
    env.cronSecret = "c".repeat(32);
    await request(app)
      .get("/api/cron/github-sync")
      .set("Authorization", "Bearer wrong")
      .expect(401);
    await request(app).get("/api/cron/github-sync").expect(401);
  });

  it("syncs when Vercel Cron calls it", async () => {
    env.cronSecret = "c".repeat(32);
    stubGitHub(REPOS);
    const response = await request(app)
      .get("/api/cron/github-sync")
      .set("Authorization", `Bearer ${"c".repeat(32)}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      github: { repoCount: REPOS.length },
    });
  });
});
