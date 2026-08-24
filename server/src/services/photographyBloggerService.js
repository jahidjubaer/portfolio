import { env } from "../config/env.js";
import {
  parseConfiguredBlogUrl,
  stripHtml,
  extractAlternateUrl,
  resizeBloggerImageUrl,
} from "./bloggerShared.js";

/**
 * Fetches and normalizes photographs from a Blogger photography blog's
 * public JSON feed. One Blogger post commonly holds one photograph on this
 * blog, but the extraction below is written to handle several images in a
 * single post — each becomes its own normalized photo item.
 *
 * Real feed evidence (jahid-thecapturecrew.blogspot.com, inspected before
 * writing this) showed:
 *  - every content image hosted on blogger.googleusercontent.com
 *  - a bare "/s<N>/" or "/w<W>-h<H>/" size segment on the <img src>, not
 *    always the cropped "-c" form media$thumbnail uses
 *  - an explicit caption only when Blogger's "tr-caption-container" table
 *    layout was used (a <td class="tr-caption"> sibling of the image cell);
 *    otherwise no caption text exists at all
 *  - large blocks of unrelated SEO keyword text elsewhere in some posts,
 *    which must never be mistaken for a caption
 */

const FEED_PATH = "/feeds/posts/default?alt=json&max-results=50";
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 20 * 60 * 1000;
const FULL_SIZE = 1600;
const THUMBNAIL_SIZE = 500;
const CONTENT_IMAGE_HOST = "blogger.googleusercontent.com";
const MIN_DIMENSION_PX = 50;

/** @type {{ photos: Array<object>, fetchedAt: number } | null} */
let cache = null;

export function isPhotographyBlogConfigured() {
  return parseConfiguredBlogUrl(env.photographyBlogUrl) !== null;
}

function buildFeedUrl(blogUrl) {
  const base = blogUrl.toString().replace(/\/+$/, "");
  return `${base}${FEED_PATH}`;
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match ? match[1] : null;
}

/**
 * The stable identity of the underlying asset, independent of which size
 * variant a particular <img> tag happened to request — used to drop a
 * second reference to the same physical photo within one post.
 */
function imageBaseKey(src) {
  return src.replace(/\/(?:s\d+(?:-w\d+-h\d+)?|w\d+-h\d+)(?:-c)?\//, "/");
}

function isUsableContentImage(tag, src) {
  if (!src || !src.includes(CONTENT_IMAGE_HOST)) return false;
  const width = Number(getAttr(tag, "data-original-width"));
  const height = Number(getAttr(tag, "data-original-height"));
  if (Number.isFinite(width) && width > 0 && width < MIN_DIMENSION_PX) {
    return false;
  }
  if (Number.isFinite(height) && height > 0 && height < MIN_DIMENSION_PX) {
    return false;
  }
  return true;
}

/**
 * Finds every <img> tag in post content HTML, in document order, along
 * with the position each occupies — needed to later match each image with
 * whichever caption immediately follows it (and only it).
 */
function findContentImages(html) {
  const images = [];
  const pattern = /<img\b[^>]*>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const tag = match[0];
    const src = getAttr(tag, "src");
    if (!isUsableContentImage(tag, src)) continue;
    images.push({
      src,
      alt: getAttr(tag, "alt"),
      start: match.index,
      end: match.index + tag.length,
    });
  }
  return images;
}

/**
 * Finds every Blogger "tr-caption" block (the only reliable explicit
 * caption source this blog's markup provides) with its position.
 */
function findCaptionBlocks(html) {
  const captions = [];
  const pattern =
    /<td[^>]*\bclass="[^"]*\btr-caption\b[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const text = stripHtml(match[1]);
    if (text) captions.push({ text, start: match.index });
  }
  return captions;
}

/**
 * Pairs each image with the next caption block that appears before the
 * following image (i.e. the caption immediately following it in the
 * document, not one that actually belongs to a later photo).
 */
function attachCaptions(images, captions) {
  return images.map((image, index) => {
    const boundary = images[index + 1]?.start ?? Infinity;
    const caption = captions.find(
      (candidate) => candidate.start > image.end && candidate.start < boundary,
    );
    return { ...image, caption: caption?.text ?? null };
  });
}

function extractCategory(entry) {
  const categories = Array.isArray(entry.category) ? entry.category : [];
  const first = categories.find((category) => category?.term)?.term;
  return first || "uncategorized";
}

/**
 * @returns {Array<object>} zero or more normalized photos for this entry —
 *   zero when the post has no usable content image or no verifiable URL.
 */
function normalizeEntry(entry, blogOrigin) {
  const postUrl = extractAlternateUrl(entry, blogOrigin);
  if (!postUrl) return [];

  const content = entry.content?.$t || entry.summary?.$t || "";
  if (!content) return [];

  const rawImages = findContentImages(content);
  if (rawImages.length === 0) return [];

  const images = attachCaptions(rawImages, findCaptionBlocks(content));

  const postTitle = entry.title?.$t?.trim() || "Untitled";
  const category = extractCategory(entry);
  const publishedAt = entry.published?.$t || null;
  const postId = entry.id?.$t || postUrl;

  const seen = new Set();
  const photos = [];

  images.forEach((image, index) => {
    const key = imageBaseKey(image.src);
    if (seen.has(key)) return; // same physical photo referenced twice
    seen.add(key);

    const explicitCaption = image.caption;
    const rawAlt = image.alt?.trim() || null;
    const caption = explicitCaption || rawAlt || postTitle || "Photograph";

    photos.push({
      id: `${postId}-${index}`,
      src: resizeBloggerImageUrl(image.src, FULL_SIZE),
      thumbnail: resizeBloggerImageUrl(image.src, THUMBNAIL_SIZE),
      title: postTitle,
      alt: rawAlt || caption,
      caption,
      category,
      postUrl,
      publishedAt,
    });
  });

  return photos;
}

/**
 * @returns {Promise<{ ok: true, photos: Array<object> } | { ok: false, reason: "not-configured" | "upstream-error" }>}
 */
export async function getPhotographyPhotos() {
  const blogUrl = parseConfiguredBlogUrl(env.photographyBlogUrl);
  if (!blogUrl) {
    return { ok: false, reason: "not-configured" };
  }

  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { ok: true, photos: cache.photos };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(buildFeedUrl(blogUrl), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Photography Blogger feed responded with status ${response.status}`,
      );
    }

    const body = await response.json();
    const entries = Array.isArray(body?.feed?.entry) ? body.feed.entry : [];
    const photos = entries.flatMap((entry) =>
      normalizeEntry(entry, blogUrl.origin),
    );

    cache = { photos, fetchedAt: now };
    return { ok: true, photos };
  } catch (error) {
    console.error(
      `[photography] failed to fetch the Blogger feed: ${error.message || "unknown error"}`,
    );
    return { ok: false, reason: "upstream-error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function resetPhotographyPhotosCache() {
  cache = null;
}
