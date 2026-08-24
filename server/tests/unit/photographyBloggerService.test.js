import { describe, it, expect, afterEach, vi } from "vitest";
import { env } from "../../src/config/env.js";
import {
  getPhotographyPhotos,
  isPhotographyBlogConfigured,
  resetPhotographyPhotosCache,
} from "../../src/services/photographyBloggerService.js";

const original = { ...env };
const BLOG_URL = "https://jahid-thecapturecrew.blogspot.com";

function feedResponse(entries) {
  return new Response(JSON.stringify({ feed: { entry: entries } }), {
    status: 200,
  });
}

function simpleImageContent({
  src = "https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg",
  width = "3948",
  height = "2719",
  alt,
} = {}) {
  const altAttr = alt ? ` alt="${alt}"` : "";
  return `<p>&nbsp;</p><div class="separator" style="clear: both; text-align: center;"><a href="${src}" imageanchor="1"><img border="0" data-original-height="${height}" data-original-width="${width}" src="${src}"${altAttr} /></a></div><br /><p></p>`;
}

function captionedImageContent({
  src = "https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg",
  caption = "A real caption",
  alt,
} = {}) {
  const altAttr = alt ? ` alt="${alt}"` : "";
  return `<table class="tr-caption-container"><tbody><tr><td style="text-align: center;"><a href="${src}"><img border="0" data-original-height="3000" data-original-width="4000" src="${src}"${altAttr} /></a></td></tr><tr><td class="tr-caption" style="text-align: center;">${caption}</td></tr></tbody></table><p>unrelated, seo, keyword, spam, text, that, is, not, a, caption</p>`;
}

function entry({
  id = "tag:blogger.com,1999:blog-1.post-1",
  title = "A photo post",
  url = `${BLOG_URL}/2026/01/a-photo-post.html`,
  published = "2026-01-15T10:00:00.000-08:00",
  content = simpleImageContent(),
  labels = [],
} = {}) {
  return {
    id: { $t: id },
    title: { type: "text", $t: title },
    published: { $t: published },
    content: { type: "html", $t: content },
    link: [{ rel: "alternate", type: "text/html", href: url }],
    category: labels.map((term) => ({ term })),
  };
}

afterEach(() => {
  Object.assign(env, original);
  resetPhotographyPhotosCache();
  vi.restoreAllMocks();
});

describe("isPhotographyBlogConfigured", () => {
  it("is false when unset and true for a valid https URL", () => {
    env.photographyBlogUrl = "";
    expect(isPhotographyBlogConfigured()).toBe(false);
    env.photographyBlogUrl = BLOG_URL;
    expect(isPhotographyBlogConfigured()).toBe(true);
  });
});

describe("getPhotographyPhotos — not configured", () => {
  it("returns a controlled result without fetching", async () => {
    env.photographyBlogUrl = "";
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await getPhotographyPhotos();

    expect(result).toEqual({ ok: false, reason: "not-configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("getPhotographyPhotos — normalization", () => {
  it("extracts one photo from a post with one image", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ title: "Blue sky Nature" })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.ok).toBe(true);
    expect(result.photos).toHaveLength(1);
    expect(result.photos[0].title).toBe("Blue sky Nature");
    expect(result.photos[0].postUrl).toBe(
      `${BLOG_URL}/2026/01/a-photo-post.html`,
    );
  });

  it("extracts multiple photos from a single post with multiple images", async () => {
    env.photographyBlogUrl = BLOG_URL;
    const content =
      simpleImageContent({
        src: "https://blogger.googleusercontent.com/img/b/abc/s1600/one.jpg",
      }) +
      simpleImageContent({
        src: "https://blogger.googleusercontent.com/img/b/abc/s1600/two.jpg",
      });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ content })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos).toHaveLength(2);
    expect(result.photos[0].src).toContain("one.jpg");
    expect(result.photos[1].src).toContain("two.jpg");
    expect(result.photos[0].id).not.toBe(result.photos[1].id);
  });

  it("normalizes the full-size image to the 1600px target regardless of the embedded size", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          content: simpleImageContent({
            src: "https://blogger.googleusercontent.com/img/b/abc/w640-h446/photo.jpg",
          }),
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].src).toBe(
      "https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg",
    );
  });

  it("normalizes the thumbnail to a smaller 500px target", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          content: simpleImageContent({
            src: "https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg",
          }),
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].thumbnail).toBe(
      "https://blogger.googleusercontent.com/img/b/abc/s500/photo.jpg",
    );
  });

  it("normalizes the newer '/img/a/' suffix-based image URL shape (real-world evidence)", async () => {
    env.photographyBlogUrl = BLOG_URL;
    const src =
      "https://blogger.googleusercontent.com/img/a/AVvXsEabcDEF=w640-h442";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ content: simpleImageContent({ src }) })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].src).toBe(
      "https://blogger.googleusercontent.com/img/a/AVvXsEabcDEF=s1600",
    );
    expect(result.photos[0].thumbnail).toBe(
      "https://blogger.googleusercontent.com/img/a/AVvXsEabcDEF=s500",
    );
  });

  it("extracts an explicit tr-caption as the resolved caption, ignoring trailing SEO keyword text", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          content: captionedImageContent({
            caption: "Jadukata River, Sunamganj",
          }),
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].caption).toBe("Jadukata River, Sunamganj");
    expect(result.photos[0].caption).not.toMatch(/seo|keyword|spam/i);
  });

  it("falls back to the image alt attribute when there is no explicit caption", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          content: simpleImageContent({
            alt: "Metropolitan University, Sylhet",
          }),
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].caption).toBe("Metropolitan University, Sylhet");
    expect(result.photos[0].alt).toBe("Metropolitan University, Sylhet");
  });

  it("falls back to the post title when there is neither caption nor alt", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({ title: "Sunset Tree", content: simpleImageContent() }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].caption).toBe("Sunset Tree");
    // alt must never be empty for accessibility, even with no source data.
    expect(result.photos[0].alt).toBe("Sunset Tree");
  });

  it("marks a Bengali title and caption for the client's language helper to detect", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          title: "রোদ্দুর বিকেলের সূর্য স্নান",
          content: captionedImageContent({
            caption: "ছবি: আমু বাগান, চুনারুঘাট, হবিগঞ্জ",
          }),
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    // The server returns plain text; Bengali detection itself is the
    // client's job (client/src/lib/language.js) — this just proves the
    // Bengali text survives normalization unmodified and undetected here.
    expect(result.photos[0].title).toBe("রোদ্দুর বিকেলের সূর্য স্নান");
    expect(result.photos[0].caption).toBe("ছবি: আমু বাগান, চুনারুঘাট, হবিগঞ্জ");
  });

  it("uses the first Blogger label as the category", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ labels: ["StreetPhotography"] })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].category).toBe("StreetPhotography");
  });

  it("falls back to 'uncategorized' when the post has no labels", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ labels: [] })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos[0].category).toBe("uncategorized");
  });

  it("drops a second reference to the same physical image within one post", async () => {
    env.photographyBlogUrl = BLOG_URL;
    const src = "https://blogger.googleusercontent.com/img/b/abc/s1600/dup.jpg";
    const thumbSrc =
      "https://blogger.googleusercontent.com/img/b/abc/s72-c/dup.jpg";
    const content =
      simpleImageContent({ src }) + simpleImageContent({ src: thumbSrc });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ content })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos).toHaveLength(1);
  });

  it("returns no photos for a post with empty content", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ content: "" })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos).toEqual([]);
  });

  it("ignores non-image content and never invents a photo from it", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          content:
            '<p>Just some text.</p><video src="https://example.com/clip.mp4"></video><iframe src="https://example.com/embed"></iframe>',
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos).toEqual([]);
  });

  it("ignores an image not hosted on Blogger's content image domain", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([
        entry({
          content: simpleImageContent({
            src: "https://example.com/tracking-pixel.gif",
          }),
        }),
      ]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos).toEqual([]);
  });

  it("drops a post with no verifiable permalink on the configured origin", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      feedResponse([entry({ url: "https://evil.example.com/fake.html" })]),
    );

    const result = await getPhotographyPhotos();

    expect(result.photos).toEqual([]);
  });
});

describe("getPhotographyPhotos — upstream failure", () => {
  it("returns a controlled failure without throwing when unreachable", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getPhotographyPhotos();

    expect(result).toEqual({ ok: false, reason: "upstream-error" });
  });

  it("returns a controlled failure on a non-2xx response", async () => {
    env.photographyBlogUrl = BLOG_URL;
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Service Unavailable", { status: 503 }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await getPhotographyPhotos();

    expect(result).toEqual({ ok: false, reason: "upstream-error" });
  });
});

describe("getPhotographyPhotos — cache", () => {
  it("avoids a second fetch within the cache window", async () => {
    env.photographyBlogUrl = BLOG_URL;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(feedResponse([entry()]));

    await getPhotographyPhotos();
    await getPhotographyPhotos();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fetches again after the cache is reset", async () => {
    env.photographyBlogUrl = BLOG_URL;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => feedResponse([entry()]));

    await getPhotographyPhotos();
    resetPhotographyPhotosCache();
    await getPhotographyPhotos();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
