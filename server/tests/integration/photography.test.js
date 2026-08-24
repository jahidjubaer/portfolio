import { describe, it, expect, afterEach, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { resetPhotographyPhotosCache } from "../../src/services/photographyBloggerService.js";

const original = { ...env };
const BLOG_URL = "https://jahid-thecapturecrew.blogspot.com";

afterEach(() => {
  Object.assign(env, original);
  resetPhotographyPhotosCache();
  vi.restoreAllMocks();
});

describe("GET /api/photography", () => {
  it("returns a controlled configuration-unavailable response when unset", async () => {
    env.photographyBlogUrl = "";

    const response = await request(app).get("/api/photography");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      configured: false,
      photos: [],
      source: "Blogger",
    });
  });

  it("returns normalized photos when configured and reachable", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          feed: {
            entry: [
              {
                id: { $t: "tag:blogger.com,1999:blog-1.post-1" },
                title: { $t: "Blue sky Nature" },
                published: { $t: "2026-06-30T12:12:12.987-07:00" },
                content: {
                  $t: '<div class="separator"><a href="https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg"><img border="0" data-original-height="2719" data-original-width="3948" src="https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg" /></a></div>',
                },
                link: [
                  {
                    rel: "alternate",
                    type: "text/html",
                    href: `${BLOG_URL}/2026/06/blue-sky-nature.html`,
                  },
                ],
                category: [{ term: "Nature" }],
              },
            ],
          },
        }),
        { status: 200 },
      ),
    );

    const response = await request(app).get("/api/photography");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.configured).toBe(true);
    expect(response.body.source).toBe("Blogger");
    expect(response.body.photos).toHaveLength(1);
    expect(response.body.photos[0]).toMatchObject({
      title: "Blue sky Nature",
      category: "Nature",
      postUrl: `${BLOG_URL}/2026/06/blue-sky-nature.html`,
    });
    // Only normalized fields are exposed — never raw feed/HTML content.
    expect(response.body.photos[0]).not.toHaveProperty("content");
    expect(JSON.stringify(response.body)).not.toMatch(/<div|<img|<table/);
    expect(response.body).not.toHaveProperty("feed");
  });

  it("returns a controlled 502 when the feed is unreachable, without a stack trace", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app).get("/api/photography");

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.stack).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toMatch(/at\s+\S+\s+\(/);
  });
});

describe("existing routes remain unaffected by the photography route", () => {
  it("GET /api/health still returns 200", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, status: "ok" });
  });

  it("GET /api/blog/posts still responds (not shadowed by /api/photography)", async () => {
    const response = await request(app).get("/api/blog/posts");
    expect(response.status).toBe(200);
    expect(response.body.source).toBe("Blogger");
  });
});
