import { describe, it, expect } from "vitest";
import {
  parseConfiguredBlogUrl,
  stripHtml,
  truncate,
  extractAlternateUrl,
  resizeBloggerImageUrl,
} from "../../src/services/bloggerShared.js";

describe("parseConfiguredBlogUrl", () => {
  it("returns null for missing, malformed, or non-http(s) values", () => {
    expect(parseConfiguredBlogUrl("")).toBeNull();
    expect(parseConfiguredBlogUrl("not a url")).toBeNull();
    expect(parseConfiguredBlogUrl("ftp://example.com")).toBeNull();
  });

  it("parses a valid https URL", () => {
    const parsed = parseConfiguredBlogUrl("https://example.blogspot.com");
    expect(parsed).toBeInstanceOf(URL);
    expect(parsed.origin).toBe("https://example.blogspot.com");
  });
});

describe("stripHtml", () => {
  it("strips tags, decodes entities, and collapses whitespace", () => {
    expect(
      stripHtml("<p>Hello&nbsp;&nbsp;<b>World</b></p>\n\n<div>!</div>"),
    ).toBe("Hello World !");
  });

  it("returns an empty string for non-string or empty input", () => {
    expect(stripHtml(null)).toBe("");
    expect(stripHtml("")).toBe("");
  });
});

describe("truncate", () => {
  it("leaves short text unchanged", () => {
    expect(truncate("short text", 200)).toBe("short text");
  });

  it("truncates on a word boundary with an ellipsis", () => {
    const long = "word ".repeat(60).trim();
    const result = truncate(long, 100);
    expect(result.length).toBeLessThanOrEqual(101);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("extractAlternateUrl", () => {
  const origin = "https://example.blogspot.com";

  it("returns the permalink when it matches the configured origin", () => {
    const entry = {
      link: [
        { rel: "alternate", type: "text/html", href: `${origin}/post.html` },
      ],
    };
    expect(extractAlternateUrl(entry, origin)).toBe(`${origin}/post.html`);
  });

  it("returns null when the link is on a different origin", () => {
    const entry = {
      link: [
        {
          rel: "alternate",
          type: "text/html",
          href: "https://evil.example.com/post.html",
        },
      ],
    };
    expect(extractAlternateUrl(entry, origin)).toBeNull();
  });

  it("returns null when there is no alternate link at all", () => {
    expect(extractAlternateUrl({ link: [] }, origin)).toBeNull();
    expect(extractAlternateUrl({}, origin)).toBeNull();
  });
});

describe("resizeBloggerImageUrl", () => {
  it("rewrites the classic path-based cropped thumbnail segment", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/b/x/y/s72-c/photo.jpg",
        640,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/b/x/y/s640/photo.jpg");
  });

  it("rewrites a path-based segment that includes explicit width/height", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/b/x/y/s72-w400-h263-c/photo.jpg",
        640,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/b/x/y/s640/photo.jpg");
  });

  it("rewrites a bare path-based size segment with no crop suffix", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/b/x/y/s1600/photo.jpg",
        500,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/b/x/y/s500/photo.jpg");
  });

  it("rewrites a path-based width-height segment with no leading 's'", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/b/x/y/w640-h446/photo.jpg",
        1600,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/b/x/y/s1600/photo.jpg");
  });

  it("rewrites the newer suffix-based '=w-h' directive (real-world /img/a/ shape)", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/a/AVvXsEabc=w640-h442",
        1600,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/a/AVvXsEabc=s1600");
  });

  it("rewrites an existing suffix-based '=s' directive", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/a/AVvXsEabc=s220",
        500,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/a/AVvXsEabc=s500");
  });

  it("appends a size directive to an /img/a/ URL that has none yet", () => {
    expect(
      resizeBloggerImageUrl(
        "https://blogger.googleusercontent.com/img/a/AVvXsEabc",
        1600,
      ),
    ).toBe("https://blogger.googleusercontent.com/img/a/AVvXsEabc=s1600");
  });

  it("returns non-Blogger URLs unchanged", () => {
    expect(resizeBloggerImageUrl("https://example.com/photo.jpg", 1600)).toBe(
      "https://example.com/photo.jpg",
    );
  });

  it("returns null for empty or non-string input", () => {
    expect(resizeBloggerImageUrl("", 1600)).toBeNull();
    expect(resizeBloggerImageUrl(null, 1600)).toBeNull();
  });
});
