import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { SignJWT } from "jose";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { createSessionToken } from "../../src/auth/session.js";

const ORIGIN = "http://localhost:5173";
const ADMIN = { id: 139990599, login: "jahidjubaer", avatarUrl: "https://a/1" };
const original = { ...env };

function stubGitHub({ user = ADMIN, tokenOk = true } = {}) {
  const fetchMock = vi.fn(async (url) => {
    if (String(url).includes("access_token")) {
      return new Response(
        JSON.stringify(
          tokenOk ? { access_token: "gho_test" } : { error: "bad_code" },
        ),
        { status: 200 },
      );
    }
    return new Response(
      JSON.stringify({
        id: user.id,
        login: user.login,
        avatar_url: user.avatarUrl,
      }),
      { status: 200 },
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Runs the OAuth dance on an agent and returns the callback response. */
async function signIn(agent) {
  const start = await agent.get("/api/auth/github");
  const state = new URL(start.headers.location).searchParams.get("state");
  return agent.get(`/api/auth/github/callback?code=abc&state=${state}`);
}

function sessionCookie(token) {
  return `admin_session=${token}`;
}

beforeEach(() => {
  Object.assign(env, {
    clientOrigin: ORIGIN,
    githubClientId: "test-client-id",
    githubClientSecret: "test-client-secret",
    sessionSecret: "x".repeat(40),
    adminGithubId: ADMIN.id,
    oauthCallbackUrl: "",
  });
});

afterEach(() => {
  Object.assign(env, original);
  vi.unstubAllGlobals();
});

describe("GET /api/auth/github", () => {
  it("redirects to GitHub with a state that is also set as a cookie", async () => {
    const response = await request(app).get("/api/auth/github");
    expect(response.status).toBe(302);

    const location = new URL(response.headers.location);
    expect(location.origin + location.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    );
    expect(location.searchParams.get("client_id")).toBe("test-client-id");
    expect(location.searchParams.get("scope")).toBeNull();

    const state = location.searchParams.get("state");
    expect(state).toMatch(/^[\w-]{40,}$/);
    expect(response.headers["set-cookie"].join(";")).toContain(
      `oauth_state=${state}`,
    );
  });

  it("answers 503 when sign-in is not configured", async () => {
    env.sessionSecret = "too-short";
    const response = await request(app).get("/api/auth/github");
    expect(response.status).toBe(503);
  });
});

describe("GET /api/auth/github/callback", () => {
  it("signs in the allowed account with a strict, httpOnly cookie", async () => {
    stubGitHub();
    const agent = request.agent(app);
    const response = await signIn(agent);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`${ORIGIN}/admin`);
    const cookie = response.headers["set-cookie"].find((value) =>
      value.startsWith("admin_session="),
    );
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({ id: ADMIN.id, login: "jahidjubaer" });
  });

  it("rejects any other GitHub account", async () => {
    stubGitHub({ user: { id: 42, login: "someone", avatarUrl: "x" } });
    const agent = request.agent(app);
    const response = await signIn(agent);

    expect(response.headers.location).toBe(`${ORIGIN}/admin?error=not-allowed`);
    expect(
      (response.headers["set-cookie"] ?? []).some((value) =>
        value.startsWith("admin_session=ey"),
      ),
    ).toBe(false);
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });

  it("rejects a missing or mismatched state", async () => {
    const fetchMock = stubGitHub();
    const agent = request.agent(app);
    await agent.get("/api/auth/github");
    const response = await agent.get(
      "/api/auth/github/callback?code=abc&state=forged",
    );

    expect(response.headers.location).toBe(`${ORIGIN}/admin?error=state`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a failed GitHub exchange", async () => {
    stubGitHub({ tokenOk: false });
    const response = await signIn(request.agent(app));
    expect(response.headers.location).toBe(`${ORIGIN}/admin?error=github`);
  });
});

describe("session checks", () => {
  it("requires a session for /api/auth/me", async () => {
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
  });

  it("rejects tampered, foreign-key, and expired tokens", async () => {
    const valid = await createSessionToken(ADMIN);
    const tampered = `${valid.slice(0, -2)}xx`;
    const foreignKey = await new SignJWT({ login: "jahidjubaer" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(ADMIN.id))
      .setIssuer("jahid-portfolio")
      .setAudience("admin")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("y".repeat(40)));
    const expired = await new SignJWT({ login: "jahidjubaer" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(ADMIN.id))
      .setIssuer("jahid-portfolio")
      .setAudience("admin")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 10 * 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(env.sessionSecret));

    for (const token of [tampered, foreignKey, expired]) {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", sessionCookie(token));
      expect(response.status).toBe(401);
    }
  });

  it("revokes sessions when the allowed account changes", async () => {
    const token = await createSessionToken(ADMIN);
    env.adminGithubId = 1;
    const response = await request(app)
      .get("/api/auth/me")
      .set("Cookie", sessionCookie(token));
    expect(response.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("blocks cross-site requests and clears the cookie for the site", async () => {
    const token = await createSessionToken(ADMIN);

    const crossSite = await request(app)
      .post("/api/auth/logout")
      .set("Origin", "https://evil.example")
      .set("Cookie", sessionCookie(token));
    expect(crossSite.status).toBe(403);

    const sameSite = await request(app)
      .post("/api/auth/logout")
      .set("Origin", ORIGIN)
      .set("Cookie", sessionCookie(token));
    expect(sameSite.status).toBe(200);
    expect(sameSite.headers["set-cookie"].join(";")).toMatch(
      /admin_session=;.*Expires=Thu, 01 Jan 1970/,
    );
  });
});

describe("/api/admin/*", () => {
  it("answers 401 to signed-out callers, even for unknown paths", async () => {
    const response = await request(app).get("/api/admin/projects");
    expect(response.status).toBe(401);
  });

  it("lets a signed-in admin through to unknown paths as 404", async () => {
    const token = await createSessionToken(ADMIN);
    const response = await request(app)
      .get("/api/admin/projects")
      .set("Cookie", sessionCookie(token));
    expect(response.status).toBe(404);
  });

  it("blocks writes without the site's Origin", async () => {
    const token = await createSessionToken(ADMIN);
    const response = await request(app)
      .post("/api/admin/projects")
      .set("Cookie", sessionCookie(token));
    expect(response.status).toBe(403);
  });
});
