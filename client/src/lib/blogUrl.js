/**
 * Validates and normalizes a raw Blogger blog URL from a Vite env var,
 * shared by every Blogger-config module (client/src/config/blog.js,
 * client/src/config/photographyBlog.js) — used only for building the
 * optional "visit the original blog" link, never for fetching.
 * @param {string} value
 * @returns {string | null}
 */
export function normalizeBlogUrl(value) {
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
