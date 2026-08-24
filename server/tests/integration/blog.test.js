import { describe, it, expect, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { resetLearningPostsCache } from "../../src/services/bloggerService.js";

const original = { ...env };

afterEach(() => {
  Object.assign(env, original);
  resetLearningPostsCache();
  vi.restoreAllMocks();
});

describe("GET /api/blog/posts", () => {
  it("returns a controlled configuration-unavailable response when no Blogger URL is set", async () => {
    env.bloggerBlogUrl = "";

    const response = await request(app).get("/api/blog/posts");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      configured: false,
      posts: [],
      source: "Blogger",
    });
  });

  it("returns normalized posts when Blogger is configured and reachable", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          feed: {
            entry: [
              {
                id: { $t: "tag:blogger.com,1999:blog-1.post-1" },
                title: { $t: "A post" },
                published: { $t: "2026-01-15T10:00:00.000-08:00" },
                updated: { $t: "2026-01-15T10:00:00.000-08:00" },
                summary: { $t: "<p>A summary.</p>" },
                link: [
                  {
                    rel: "alternate",
                    type: "text/html",
                    href: "https://jahid-notes.blogspot.com/2026/01/a-post.html",
                  },
                ],
                category: [{ term: "React" }],
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const response = await request(app).get("/api/blog/posts");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.configured).toBe(true);
    expect(response.body.source).toBe("Blogger");
    expect(response.body.posts).toHaveLength(1);
    expect(response.body.posts[0]).toMatchObject({
      title: "A post",
      url: "https://jahid-notes.blogspot.com/2026/01/a-post.html",
      excerpt: "A summary.",
      labels: ["React"],
    });
    // Only normalized fields are exposed — never the raw Blogger payload.
    expect(response.body.posts[0]).not.toHaveProperty("content");
    expect(response.body).not.toHaveProperty("feed");
  });

  it("returns a controlled 502 when Blogger is unreachable", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app).get("/api/blog/posts");

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(JSON.stringify(response.body)).not.toMatch(/at\s+\S+\s+\(/);
    expect(response.body.stack).toBeUndefined();
  });
});

describe("GET /api/health remains unaffected by the blog route", () => {
  it("still returns 200 with the required response shape", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, status: "ok" });
  });
});
