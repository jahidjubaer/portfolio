import { env } from "../config/env.js";

/**
 * Fetches and normalizes published posts from a Blogger blog's public JSON
 * feed. The portfolio never authors content here — Blogger is the source of
 * truth; this module only reads, normalizes, and caches it.
 *
 * No Google OAuth, no Blogger write API, no API key — Blogger's default
 * feed (`/feeds/posts/default?alt=json`) is public and sufficient.
 */

const FEED_PATH = "/feeds/posts/default?alt=json&max-results=20";
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 15 * 60 * 1000;

/** @type {{ posts: Array<object>, fetchedAt: number } | null} */
let cache = null;

/**
 * Validates the configured Blogger URL and returns its parsed form, or null
 * if it is missing, malformed, or not http/https.
 * @returns {URL | null}
 */
function parseConfiguredBlogUrl() {
  if (!env.bloggerBlogUrl) return null;
  try {
    const parsed = new URL(env.bloggerBlogUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isBlogConfigured() {
  return parseConfiguredBlogUrl() !== null;
}

function buildFeedUrl(blogUrl) {
  const base = blogUrl.toString().replace(/\/+$/, "");
  return `${base}${FEED_PATH}`;
}

function stripHtml(html) {
  if (typeof html !== "string" || !html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text, max = 200) {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  const cut = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.trim()}…`;
}

function extractThumbnail(entry) {
  const raw = entry["media$thumbnail"]?.url;
  if (typeof raw !== "string" || !raw) return null;
  // Blogger's feed thumbnail is a small crop, but the size segment's exact
  // shape varies — plain "/s72-c/" on some posts, "/s72-w400-h263-c/" (with
  // explicit width/height) on others. Match either so real posts don't
  // silently keep their tiny original crop.
  return raw.replace(/\/s\d+(?:-w\d+-h\d+)?-c\//, "/s640/");
}

/**
 * Only accepts an article permalink that is a real http/https URL on the
 * exact configured Blogger origin — never a feed-provided URL on another
 * domain or protocol.
 */
function extractUrl(entry, blogOrigin) {
  const links = Array.isArray(entry.link) ? entry.link : [];
  const alternate = links.find(
    (link) => link?.rel === "alternate" && link?.type === "text/html",
  );
  const href = alternate?.href;
  if (typeof href !== "string" || !/^https?:\/\//.test(href)) return null;

  try {
    const parsed = new URL(href);
    if (parsed.origin !== blogOrigin) return null;
    return href;
  } catch {
    return null;
  }
}

function extractLabels(entry) {
  const categories = Array.isArray(entry.category) ? entry.category : [];
  return categories.map((category) => category?.term).filter(Boolean);
}

/**
 * @returns {object | null} the normalized post, or null if the entry has no
 *   safe, verifiable article URL (in which case it is dropped, not shown).
 */
function normalizeEntry(entry, blogOrigin) {
  const url = extractUrl(entry, blogOrigin);
  if (!url) return null;

  const title = entry.title?.$t?.trim() || "Untitled post";
  const summarySource = entry.summary?.$t || entry.content?.$t || "";
  const excerpt = truncate(stripHtml(summarySource), 200);

  return {
    id: entry.id?.$t || url,
    title,
    url,
    publishedAt: entry.published?.$t || null,
    updatedAt: entry.updated?.$t || null,
    excerpt,
    thumbnail: extractThumbnail(entry),
    labels: extractLabels(entry),
  };
}

/**
 * @returns {Promise<{ ok: true, posts: Array<object> } | { ok: false, reason: "not-configured" | "upstream-error" }>}
 */
export async function getLearningPosts() {
  const blogUrl = parseConfiguredBlogUrl();
  if (!blogUrl) {
    return { ok: false, reason: "not-configured" };
  }

  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { ok: true, posts: cache.posts };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(buildFeedUrl(blogUrl), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Blogger feed responded with status ${response.status}`);
    }

    const body = await response.json();
    const entries = Array.isArray(body?.feed?.entry) ? body.feed.entry : [];
    const posts = entries
      .map((entry) => normalizeEntry(entry, blogUrl.origin))
      .filter(Boolean);

    cache = { posts, fetchedAt: now };
    return { ok: true, posts };
  } catch (error) {
    console.error(
      `[blog] failed to fetch the Blogger feed: ${error.message || "unknown error"}`,
    );
    return { ok: false, reason: "upstream-error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function resetLearningPostsCache() {
  cache = null;
}
