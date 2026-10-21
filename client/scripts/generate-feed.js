/**
 * Generates client/public/rss.xml: an RSS 2.0 feed of the published posts
 * in the content snapshot (drafts never reach it), newest first, so feed
 * readers can follow the Writing page. Runs with the sitemap in prebuild
 * (`npm run seo:generate`); the base URL comes from site-url.js.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSiteUrl } from "./site-url.js";
import { PAGE_META } from "../src/routes/route-meta.js";

const CLIENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_FILE = join(CLIENT_ROOT, "src", "generated", "content.json");
const FEED_FILE = join(CLIENT_ROOT, "public", "rss.xml");

export const FEED_PATH = "/rss.xml";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "2025-09-12" → "Fri, 12 Sep 2025 00:00:00 GMT" (RFC 822, as RSS wants). */
function rfc822(date) {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`).toUTCString();
}

/**
 * @param {string} siteUrl
 * @param {Array<{ slug: string, title: string, excerpt: string, publishedAt: string, tags?: string[], status?: string }>} posts
 */
export function buildFeed(siteUrl, posts) {
  const published = posts
    .filter((post) => post.status !== "draft")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const items = published
    .map((post) => {
      const link = `${siteUrl}/writing/${post.slug}`;
      const categories = (post.tags ?? [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${rfc822(post.publishedAt)}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  const updated = published[0] ? rfc822(published[0].publishedAt) : null;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Jahid Hasan — Writing</title>",
    `    <link>${escapeXml(`${siteUrl}/writing`)}</link>`,
    `    <description>${escapeXml(PAGE_META["/writing"].description)}</description>`,
    "    <language>bn</language>",
    `    <atom:link href="${escapeXml(`${siteUrl}${FEED_PATH}`)}" rel="self" type="application/rss+xml" />`,
    updated ? `    <lastBuildDate>${updated}</lastBuildDate>` : null,
    items || null,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function main() {
  const siteUrl = resolveSiteUrl();
  const content = JSON.parse(readFileSync(CONTENT_FILE, "utf8"));
  const posts = content.posts ?? [];
  writeFileSync(FEED_FILE, buildFeed(siteUrl, posts));
  console.log(`[seo] wrote rss.xml (${posts.length} posts, base ${siteUrl})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
