import { env } from "../config/env.js";
import {
  parseConfiguredBlogUrl,
  stripHtml,
  truncate,
  extractAlternateUrl,
  resizeBloggerImageUrl,
} from "./bloggerShared.js";

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
const THUMBNAIL_SIZE = 640;

/** @type {{ posts: Array<object>, fetchedAt: number } | null} */
let cache = null;

export function isBlogConfigured() {
  return parseConfiguredBlogUrl(env.bloggerBlogUrl) !== null;
}

function buildFeedUrl(blogUrl) {
  const base = blogUrl.toString().replace(/\/+$/, "");
  return `${base}${FEED_PATH}`;
}

function extractThumbnail(entry) {
  const raw = entry["media$thumbnail"]?.url;
  if (typeof raw !== "string" || !raw) return null;
  return resizeBloggerImageUrl(raw, THUMBNAIL_SIZE);
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
  const url = extractAlternateUrl(entry, blogOrigin);
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
  const blogUrl = parseConfiguredBlogUrl(env.bloggerBlogUrl);
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
