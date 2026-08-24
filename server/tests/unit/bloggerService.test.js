import { describe, it, expect, afterEach, vi } from "vitest";
import { env } from "../../src/config/env.js";
import {
  getLearningPosts,
  isBlogConfigured,
  resetLearningPostsCache,
} from "../../src/services/bloggerService.js";

const original = { ...env };

function feedResponse(entries) {
  return new Response(JSON.stringify({ feed: { entry: entries } }), {
    status: 200,
  });
}

function entry({
  id = "tag:blogger.com,1999:blog-1.post-1",
  title = "A post title",
  url = "https://jahid-notes.blogspot.com/2026/01/a-post-title.html",
  published = "2026-01-15T10:00:00.000-08:00",
  updated = "2026-01-16T10:00:00.000-08:00",
  summary = "<p>A <b>summary</b> with markup.</p>",
  content,
  thumbnail = "https://blogger.googleusercontent.com/img/a/s72-c/photo.jpg",
  labels = ["JavaScript", "React"],
} = {}) {
  const base = {
    id: { $t: id },
    title: { type: "text", $t: title },
    published: { $t: published },
    updated: { $t: updated },
    link: [{ rel: "alternate", type: "text/html", href: url }],
    category: labels.map((term) => ({ term })),
  };
  if (summary !== null) base.summary = { type: "html", $t: summary };
  if (content) base.content = { type: "html", $t: content };
  if (thumbnail) base["media$thumbnail"] = { url: thumbnail };
  return base;
}

afterEach(() => {
  Object.assign(env, original);
  resetLearningPostsCache();
  vi.restoreAllMocks();
});

describe("isBlogConfigured", () => {
  it("is false when no Blogger URL is configured", () => {
    env.bloggerBlogUrl = "";
    expect(isBlogConfigured()).toBe(false);
  });

  it("is false for a malformed or non-http(s) URL", () => {
    env.bloggerBlogUrl = "not a url";
    expect(isBlogConfigured()).toBe(false);
    env.bloggerBlogUrl = "ftp://example.blogspot.com";
    expect(isBlogConfigured()).toBe(false);
  });

  it("is true for a valid https Blogger URL", () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    expect(isBlogConfigured()).toBe(true);
  });
});

describe("getLearningPosts — not configured", () => {
  it("returns a controlled not-configured result without fetching", async () => {
    env.bloggerBlogUrl = "";
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await getLearningPosts();

    expect(result).toEqual({ ok: false, reason: "not-configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("getLearningPosts — normalization", () => {
  it("normalizes title, permalink, published date, updated date, and labels", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          title: "Learning React Server Components",
          url: "https://jahid-notes.blogspot.com/2026/01/rsc.html",
          published: "2026-01-15T10:00:00.000-08:00",
          updated: "2026-01-16T10:00:00.000-08:00",
          labels: ["React", "Notes"],
        }),
      ]),
    );

    const result = await getLearningPosts();

    expect(result.ok).toBe(true);
    expect(result.posts).toHaveLength(1);
    const [post] = result.posts;
    expect(post.title).toBe("Learning React Server Components");
    expect(post.url).toBe("https://jahid-notes.blogspot.com/2026/01/rsc.html");
    expect(post.publishedAt).toBe("2026-01-15T10:00:00.000-08:00");
    expect(post.updatedAt).toBe("2026-01-16T10:00:00.000-08:00");
    expect(post.labels).toEqual(["React", "Notes"]);
  });

  it("strips HTML and collapses whitespace in the excerpt", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          summary: "<p>Line one.</p>\n\n<div>  Line   two with   gaps. </div>",
        }),
      ]),
    );

    const result = await getLearningPosts();

    const [post] = result.posts;
    expect(post.excerpt).not.toMatch(/<[^>]+>/);
    expect(post.excerpt).toBe("Line one. Line two with gaps.");
  });

  it("truncates a long excerpt cleanly to roughly 140-220 characters", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    const longText = "word ".repeat(100).trim();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ summary: longText })]),
    );

    const result = await getLearningPosts();

    const [post] = result.posts;
    expect(post.excerpt.length).toBeLessThanOrEqual(201);
    expect(post.excerpt.length).toBeGreaterThanOrEqual(140);
    expect(post.excerpt.endsWith("…")).toBe(true);
    // Truncation lands on a word boundary — never mid-word.
    expect(post.excerpt.slice(0, -1).endsWith("word")).toBe(true);
  });

  it("falls back to content when no summary is present", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({ summary: null, content: "<p>Full content excerpt.</p>" }),
      ]),
    );

    const result = await getLearningPosts();

    expect(result.posts[0].excerpt).toBe("Full content excerpt.");
  });

  it("extracts and upsizes a real Blogger thumbnail", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          thumbnail:
            "https://blogger.googleusercontent.com/img/a/s72-c/photo.jpg",
        }),
      ]),
    );

    const result = await getLearningPosts();

    expect(result.posts[0].thumbnail).toBe(
      "https://blogger.googleusercontent.com/img/a/s640/photo.jpg",
    );
  });

  it("upsizes a thumbnail whose size segment includes explicit width/height (real-world Blogger shape)", async () => {
    // Discovered against the real jahider-notekhata.blogspot.com feed —
    // Blogger does not always emit the plain "s72-c" form.
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          thumbnail:
            "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj/s72-w400-h263-c/photo.png",
        }),
      ]),
    );

    const result = await getLearningPosts();

    expect(result.posts[0].thumbnail).toBe(
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj/s640/photo.png",
    );
  });

  it("returns a null thumbnail when the entry has none", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ thumbnail: null })]),
    );

    const result = await getLearningPosts();

    expect(result.posts[0].thumbnail).toBeNull();
  });

  it("drops an entry whose link is not on the configured Blogger origin", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ url: "https://evil.example.com/phishing.html" })]),
    );

    const result = await getLearningPosts();

    expect(result.posts).toEqual([]);
  });

  it("returns an empty posts array for an empty feed", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(feedResponse([]));

    const result = await getLearningPosts();

    expect(result).toEqual({ ok: true, posts: [] });
  });
});

describe("getLearningPosts — upstream failure", () => {
  it("returns a controlled failure without throwing when Blogger is unreachable", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("network down"),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getLearningPosts();

    expect(result).toEqual({ ok: false, reason: "upstream-error" });
  });

  it("returns a controlled failure when Blogger responds with a non-2xx status", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Service Unavailable", { status: 503 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getLearningPosts();

    expect(result).toEqual({ ok: false, reason: "upstream-error" });
  });
});

describe("getLearningPosts — cache", () => {
  it("avoids a second fetch within the cache window", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(feedResponse([entry()]));

    await getLearningPosts();
    await getLearningPosts();
    await getLearningPosts();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fetches again after the cache is reset", async () => {
    env.bloggerBlogUrl = "https://jahid-notes.blogspot.com";
    // A Response body can only be read once — a fresh Response per call
    // proves the second getLearningPosts() call actually re-reads the
    // network, not just that fetch() was invoked twice.
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => feedResponse([entry()]));

    const first = await getLearningPosts();
    resetLearningPostsCache();
    const second = await getLearningPosts();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
  });
});
