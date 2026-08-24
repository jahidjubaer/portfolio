/**
 * Primitives shared by every Blogger-backed feature (Learning posts,
 * Photography). Kept here — not duplicated per-service — since the parsing
 * rules (HTML stripping, entity decoding, image-size rewriting, permalink
 * validation) are identical regardless of which blog is being read.
 */

/**
 * Validates a raw Blogger blog URL string and returns its parsed form, or
 * null if missing, malformed, or not http/https.
 * @param {string} rawUrl
 * @returns {URL | null}
 */
export function parseConfiguredBlogUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Blogger's rich-text editor emits HTML entities (most commonly &nbsp;)
 * inside post content — stripping tags alone leaves those literal entity
 * codes behind, so they're decoded here too.
 */
export function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

export function stripHtml(html) {
  if (typeof html !== "string" || !html) return "";
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text, max = 200) {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max);
  const lastSpace = clipped.lastIndexOf(" ");
  const cut = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped;
  return `${cut.trim()}…`;
}

/**
 * Only accepts an article permalink that is a real http/https URL on the
 * exact configured Blogger origin — never a feed-provided URL on another
 * domain or protocol.
 * @param {object} entry
 * @param {string} blogOrigin
 * @returns {string | null}
 */
export function extractAlternateUrl(entry, blogOrigin) {
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

// Blogger/Google's image CDN serves the same content under two different
// URL shapes (both confirmed live, not assumed):
//  - classic, path-based ("/img/b/...") — a size directive as its own path
//    segment: "/s72-c/", "/s72-w400-h263-c/", "/s1600/", "/w640-h446/".
//  - newer, suffix-based ("/img/a/...") — a size directive appended
//    directly to the token after "=", with no trailing path at all:
//    "...token=w640-h442", "...token=s1600".
const PATH_SIZE_SEGMENT = /\/(?:s\d+(?:-w\d+-h\d+)?|w\d+-h\d+)(?:-c)?\//;
const SUFFIX_SIZE_DIRECTIVE = /=(?:s\d+(?:-w\d+-h\d+)?|w\d+-h\d+)(?:-c)?$/;

/**
 * Rewrites a Blogger-hosted image URL to request a different size, using
 * whichever size directive Blogger's own CDN already accepts for that
 * URL's shape (confirmed against the live CDN for both shapes above —
 * requesting a size larger than the source simply returns the source at
 * its native resolution, never upscaled). Returns the URL unchanged if it
 * doesn't look like a resizable Blogger/Google image URL at all.
 * @param {string} rawUrl
 * @param {number} targetSize
 * @returns {string | null}
 */
export function resizeBloggerImageUrl(rawUrl, targetSize) {
  if (typeof rawUrl !== "string" || !rawUrl) return null;
  if (PATH_SIZE_SEGMENT.test(rawUrl)) {
    return rawUrl.replace(PATH_SIZE_SEGMENT, `/s${targetSize}/`);
  }
  if (SUFFIX_SIZE_DIRECTIVE.test(rawUrl)) {
    return rawUrl.replace(SUFFIX_SIZE_DIRECTIVE, `=s${targetSize}`);
  }
  if (rawUrl.includes("googleusercontent.com/img/a/")) {
    // Same CDN family, but no size directive present yet — append one
    // rather than leaving the request at whatever default the CDN picks.
    return `${rawUrl}=s${targetSize}`;
  }
  return rawUrl;
}
