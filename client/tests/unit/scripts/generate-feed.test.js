import { describe, expect, it } from "vitest";
import { buildFeed } from "../../../scripts/generate-feed.js";

const POSTS = [
  {
    slug: "older",
    title: "Older & wiser",
    excerpt: "Uses <b> tags.",
    publishedAt: "2025-08-01",
    tags: ["JavaScript"],
  },
  {
    slug: "newer",
    title: "জাভা স্ক্রিপ্ট",
    excerpt: "Newest first.",
    publishedAt: "2025-09-12",
  },
  {
    slug: "draft",
    title: "Not yet",
    excerpt: "Hidden.",
    publishedAt: "2025-10-01",
    status: "draft",
  },
];

describe("buildFeed", () => {
  const feed = buildFeed("https://example.com", POSTS);

  it("lists published posts, newest first, linking to this site", () => {
    const links = [
      ...feed.matchAll(/<item>\s*<title>[^<]*<\/title>\s*<link>([^<]+)/g),
    ].map((match) => match[1]);
    expect(links).toEqual([
      "https://example.com/writing/newer",
      "https://example.com/writing/older",
    ]);
    expect(feed).not.toContain("Not yet");
  });

  it("escapes text and dates items the way RSS expects", () => {
    expect(feed).toContain("<title>Older &amp; wiser</title>");
    expect(feed).toContain("<description>Uses &lt;b&gt; tags.</description>");
    expect(feed).toContain("<pubDate>Fri, 12 Sep 2025 00:00:00 GMT</pubDate>");
    expect(feed).toContain("<category>JavaScript</category>");
    expect(feed).toContain(
      '<atom:link href="https://example.com/rss.xml" rel="self" type="application/rss+xml" />',
    );
  });

  it("is still a valid channel with no posts", () => {
    const empty = buildFeed("https://example.com", []);
    expect(empty).toContain("<channel>");
    expect(empty).not.toContain("<item>");
    expect(empty).not.toContain("lastBuildDate");
  });
});
