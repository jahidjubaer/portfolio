/**
 * Central Blogger configuration. Jahid does not author articles inside this
 * portfolio — Blogger is the content source, and every component reads the
 * blog's public URL from here rather than hardcoding it.
 *
 * Used only for the optional "Visit Blogger" link — actual post data always
 * comes from the same-origin /api/blog/posts endpoint (see lib/api.js),
 * never fetched directly from Blogger by the client.
 */

const rawBlogUrl = import.meta.env.VITE_BLOGGER_BLOG_URL || "";

function normalize(value) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return value.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export const BLOG_URL = normalize(rawBlogUrl);
export const isBlogConfigured = BLOG_URL !== null;
