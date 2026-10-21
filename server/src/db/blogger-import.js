import { parseFragment } from "parse5";
import { photoSchema, postSchema } from "../schemas/content.js";
import { COLLECTIONS } from "./collections.js";

/**
 * One-time import of the Blogger blogs (R8): the photography blog
 * becomes `photos`, the notes blog becomes `posts`, and the personal Bangla
 * blog (docs/14 R5) becomes draft posts of kind "blog". Pure apart from
 * `importBlogger`, which takes the feed entries and a `rehost` function
 * (download → Vercel Blob) so tests never touch the network.
 */

// Blogger's CDN serves a size variant per URL; "s1600" caps the longest
// side at 1600 px and never upscales.
const SIZE_SEGMENT = /\/(?:s\d+(?:-w\d+-h\d+)?|w\d+-h\d+)(?:-c)?\//;
const SIZE_SUFFIX = /=(?:s\d+(?:-w\d+-h\d+)?|w\d+-h\d+)(?:-c)?$/;
const IMAGE_HOST = "blogger.googleusercontent.com";
const SKIPPED_TAGS = new Set([
  "script",
  "style",
  "svg",
  "noscript",
  "iframe",
  "button",
]);
const BLOCK_TAGS = new Set([
  "p",
  "div",
  "table",
  "tbody",
  "tr",
  "td",
  "blockquote",
  "section",
  "figure",
  "figcaption",
]);

// Photos: re-encoded as JPEG at quality 85. Some originals are PNGs of
// 2–3 MB; this serves the same 1600 px photo at a tenth of the size.
// Screenshots in posts keep their original format so text stays sharp.
export const PHOTO_VARIANT = "s1600-rj-l85";

/**
 * @param {string} src a Blogger CDN image URL, at any size
 * @param {string} [variant] the CDN's size (and format) directive
 */
export function fullSizeImageUrl(src, variant = "s1600") {
  if (SIZE_SEGMENT.test(src)) return src.replace(SIZE_SEGMENT, `/${variant}/`);
  if (SIZE_SUFFIX.test(src)) return src.replace(SIZE_SUFFIX, `=${variant}`);
  if (src.includes("googleusercontent.com/img/a/")) return `${src}=${variant}`;
  return src;
}

/** The same photo at any size variant. */
function imageKey(src) {
  return src.replace(SIZE_SEGMENT, "/").replace(SIZE_SUFFIX, "");
}

function attr(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value ?? null;
}

function hasClass(node, name) {
  return (attr(node, "class") ?? "").split(/\s+/).includes(name);
}

function textOf(node) {
  if (node.nodeName === "#text") return node.value;
  if (SKIPPED_TAGS.has(node.nodeName)) return "";
  const inner = (node.childNodes ?? []).map(textOf).join("");
  return node.nodeName === "br" || BLOCK_TAGS.has(node.nodeName)
    ? `${inner}\n`
    : inner;
}

function escapeMarkdown(text) {
  return text.replace(/([\\`*_[\]])/g, "\\$1");
}

/**
 * Wraps inline text in a marker without swallowing the spaces around it
 * ("** bold **" is not bold in Markdown).
 */
function wrap(inner, marker) {
  const match = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match[2]) return inner;
  return `${match[1]}${marker}${match[2]}${marker}${match[3]}`;
}

// Marks where a code block was set aside (a private-use character, which
// never appears in real text).
const CODE_MARK = String.fromCharCode(0xe000);
const CODE_TOKEN = new RegExp(`^${CODE_MARK}(\\d+)${CODE_MARK}$`);

function collapse(text) {
  // \s already covers no-break spaces (&nbsp;).
  return text.replace(/\s+/g, " ");
}

/**
 * Turns a Blogger post body into Markdown. Blogger's editor output is
 * mostly nested spans with inline styles; only structure survives
 * (paragraphs, bold/italic, links, images, lists, code), which is all
 * the site's Markdown renderer shows anyway. Scripts, styles, and the
 * blog theme's copy-button widgets are dropped.
 * @param {string} html
 * @returns {{ markdown: string, images: Array<{ src: string, alt: string }> }}
 */
export function bloggerHtmlToMarkdown(html) {
  const images = [];
  // Code is set aside so the paragraph clean-up below can't touch it.
  const code = [];

  function inline(node) {
    if (node.nodeName === "#text") return escapeMarkdown(collapse(node.value));
    if (node.nodeName === "#comment") return "";
    if (SKIPPED_TAGS.has(node.nodeName)) return "";
    const children = () => (node.childNodes ?? []).map(inline).join("");

    switch (node.nodeName) {
      case "br":
        return "\n";
      case "b":
      case "strong":
        return wrap(children(), "**");
      case "i":
      case "em":
        return wrap(children(), "*");
      case "code":
        return `\`${collapse(textOf(node)).trim()}\``;
      case "img": {
        const src = attr(node, "src");
        if (!src || !src.includes(IMAGE_HOST)) return "";
        const alt = collapse(attr(node, "alt") ?? "").trim();
        images.push({ src, alt });
        return `\n\n![${escapeMarkdown(alt)}](${src})\n\n`;
      }
      case "a": {
        const inner = children();
        const href = attr(node, "href") ?? "";
        // Image links point at the full-size file; the image is enough.
        // In-blog "#" links have nowhere to go once off Blogger.
        if (inner.includes("![") || !/^https?:\/\//.test(href)) return inner;
        if (!inner.trim()) return "";
        return `[${inner.trim()}](${href})`;
      }
      default:
        return BLOCK_TAGS.has(node.nodeName) ||
          /^h[1-6]$/.test(node.nodeName) ||
          ["ol", "ul", "li", "pre"].includes(node.nodeName)
          ? `\n\n${block(node)}\n\n`
          : children();
    }
  }

  function block(node) {
    const name = node.nodeName;
    if (name === "pre") {
      code.push(
        textOf(node)
          .replace(/[^\S\n]/g, " ")
          .replace(/\n+$/, ""),
      );
      return `\n\n${CODE_MARK}${code.length - 1}${CODE_MARK}\n\n`;
    }
    if (name === "ol" || name === "ul") {
      const items = (node.childNodes ?? []).filter(
        (child) => child.nodeName === "li",
      );
      return items
        .map((item, index) => {
          const marker = name === "ol" ? `${index + 1}.` : "-";
          const text = (item.childNodes ?? [])
            .map(inline)
            .join("")
            .replace(/\s+/g, " ")
            .trim();
          return `${marker} ${text}`;
        })
        .join("\n");
    }
    const inner = (node.childNodes ?? []).map(inline).join("");
    const heading = name.match(/^h([1-6])$/);
    if (heading) {
      const level = Math.max(2, Number(heading[1]));
      return `${"#".repeat(level)} ${collapse(inner).trim()}`;
    }
    return inner;
  }

  const fragment = parseFragment(html);
  const raw = fragment.childNodes.map(inline).join("");

  const markdown = raw
    .split(/\n{2,}/)
    .map((paragraph) => {
      const token = paragraph.trim().match(CODE_TOKEN);
      if (token) return `\`\`\`\n${code[Number(token[1])]}\n\`\`\``;
      const lines = paragraph
        .split("\n")
        .map((line) => line.replace(/ {2,}/g, " ").trim())
        .filter(Boolean);
      // A line break inside a paragraph stays a line break; list items
      // already start their own line.
      return lines.every((line) => /^(?:\d+\.|-) /.test(line))
        ? lines.join("\n")
        : lines.join("\\\n");
    })
    // Blogger pads posts with empty paragraphs and lone bold markers.
    .filter((paragraph) => paragraph.replace(/[*\\\s]/g, ""))
    .join("\n\n");

  return { markdown, images };
}

/** Plain text of a post, for its excerpt. */
export function plainText(html) {
  return collapse(textOf(parseFragment(html))).trim();
}

/** Cuts at a word boundary and adds an ellipsis. */
export function truncate(text, max) {
  if (text.length <= max) return text;
  const clipped = text.slice(0, max - 1);
  const space = clipped.lastIndexOf(" ");
  return `${(space > max / 2 ? clipped.slice(0, space) : clipped).trim()}…`;
}

/** ".../2025/09/javascript_12.html" → "2025-09-javascript-12" */
export function slugFromPermalink(permalink) {
  const { pathname } = new URL(permalink);
  return pathname
    .replace(/\.html$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function permalinkOf(entry) {
  return entry.link?.find(
    (link) => link.rel === "alternate" && link.type === "text/html",
  )?.href;
}

function labelsOf(entry) {
  return (entry.category ?? []).map((item) => item.term).filter(Boolean);
}

/** "StreetPhotography" → "Street photography" */
function albumName(label) {
  const words = label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// "FEATURED" was a theme flag on the blog, not a subject.
const NOT_AN_ALBUM = new Set(["featured"]);
export const DEFAULT_ALBUM = "Photography";

/**
 * The photos in one photography-blog post (normally one). The post title is
 * Jahid's own caption for the photo; an explicit Blogger caption wins.
 * @returns {Array<{ id: string, src: string, alt: string, caption: string, album: string, published: string }>}
 */
export function photosFromEntry(entry) {
  const permalink = permalinkOf(entry);
  const html = entry.content?.$t ?? "";
  if (!permalink || !html) return [];

  const title = collapse(entry.title?.$t ?? "").trim();
  const label = labelsOf(entry).find(
    (item) => !NOT_AN_ALBUM.has(item.toLowerCase()),
  );
  const fragment = parseFragment(html);
  const found = [];
  const seen = new Set();

  (function walk(node, caption) {
    if (node.nodeName === "table" && hasClass(node, "tr-caption-container")) {
      const cell = findFirst(node, (child) => hasClass(child, "tr-caption"));
      caption = cell ? collapse(textOf(cell)).trim() : caption;
    }
    if (node.nodeName === "img") {
      const src = attr(node, "src");
      const tiny = ["data-original-width", "data-original-height"].some(
        (name) => Number(attr(node, name)) > 0 && Number(attr(node, name)) < 50,
      );
      if (src?.includes(IMAGE_HOST) && !tiny && !seen.has(imageKey(src))) {
        seen.add(imageKey(src));
        found.push({ src, alt: (attr(node, "alt") ?? "").trim(), caption });
      }
    }
    for (const child of node.childNodes ?? []) walk(child, caption);
  })(fragment, null);

  const base = slugFromPermalink(permalink);
  return found.map((image, index) => {
    // A Blogger caption is usually the place; keep it next to the title.
    const caption =
      [title, image.caption]
        .filter(Boolean)
        .filter((part, i, parts) => parts.indexOf(part) === i)
        .join(" — ") || "Photograph";
    return {
      id: index === 0 ? base : `${base}-${index + 1}`,
      src: fullSizeImageUrl(image.src, PHOTO_VARIANT),
      alt: truncate(image.alt || caption, 250),
      caption,
      album: label ? albumName(label) : DEFAULT_ALBUM,
      published: entry.published?.$t ?? "",
    };
  });
}

function findFirst(node, test) {
  for (const child of node.childNodes ?? []) {
    if (test(child)) return child;
    const deeper = findFirst(child, test);
    if (deeper) return deeper;
  }
  return null;
}

// Theme flags on the personal blog ("slider" fed its carousel), not subjects.
const NOT_A_TAG = new Set(["slider", "featured"]);

/**
 * A blog post as a post. Its first image becomes the cover (and leaves the
 * body, so the post page doesn't show it twice). Notes-blog posts arrive
 * published; the personal blog's (R5) arrive as drafts of kind "blog" with
 * their Blogger address, for Jahid to publish one by one.
 * @param {object} entry
 * @param {Record<string, string>} [slugs] permalink → chosen slug
 * @param {{ kind?: "blog" }} [options]
 */
export function postFromEntry(entry, slugs = {}, { kind } = {}) {
  const permalink = permalinkOf(entry);
  const html = entry.content?.$t ?? "";
  const title = collapse(entry.title?.$t ?? "").trim();
  const { markdown, images } = bloggerHtmlToMarkdown(html);
  const cover = images[0];

  let body = markdown;
  let bodyImages = images;
  const lead = cover && `![${escapeMarkdown(cover.alt)}](${cover.src})`;
  if (lead && body.startsWith(lead)) {
    body = body.slice(lead.length).replace(/^\s+/, "");
    bodyImages = images.slice(1);
  }

  return {
    slug: slugs[permalink] ?? slugFromPermalink(permalink),
    title,
    excerpt: truncate(plainText(html), 200),
    body,
    tags: labelsOf(entry).filter((tag) => !NOT_A_TAG.has(tag.toLowerCase())),
    status: kind === "blog" ? "draft" : "published",
    ...(kind === "blog" ? { kind, originalUrl: permalink } : {}),
    publishedAt: (entry.published?.$t ?? "").slice(0, 10),
    permalink,
    cover: cover ? fullSizeImageUrl(cover.src) : null,
    coverAlt: cover ? cover.alt || `Cover image for “${title}”` : null,
    images: [...new Set(bodyImages.map((image) => image.src))],
  };
}

/**
 * Reads image dimensions from a JPEG, PNG, GIF, or WebP header.
 * @param {Uint8Array} bytes
 * @returns {{ width: number, height: number } | null}
 */
export function imageDimensions(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start, length) =>
    String.fromCharCode(...bytes.subarray(start, start + length));

  if (bytes[0] === 0x89 && ascii(1, 3) === "PNG") {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (ascii(0, 3) === "GIF") {
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const chunk = ascii(12, 4);
    if (chunk === "VP8 ") {
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    }
    if (chunk === "VP8L") {
      const bits = view.getUint32(21, true);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    if (chunk === "VP8X") {
      const read24 = (offset) =>
        bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
      return { width: read24(24) + 1, height: read24(27) + 1 };
    }
    return null;
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) return null;
      const marker = bytes[offset + 1];
      const length = view.getUint16(offset + 2);
      // Start-of-frame markers, except DHT (c4), JPG (c8), and DAC (cc).
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      ) {
        return {
          height: view.getUint16(offset + 5),
          width: view.getUint16(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }
  return null;
}

async function nextOrder(collection) {
  const [last] = await collection
    .find({}, { projection: { order: 1 } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  return last ? last.order + 1 : 0;
}

/**
 * Adds the blogs' photos and posts that aren't in the database yet (by id
 * and slug), newest first, with every image re-uploaded through `rehost`.
 * Each document is validated before it's written. Safe to run again.
 * @param {import("mongodb").Db} db
 * @param {{
 *   photoEntries: object[],
 *   postEntries: object[],
 *   blogEntries?: object[],
 *   rehost: (src: string) => Promise<{ url: string, width: number, height: number }>,
 *   slugs?: Record<string, string>,
 *   dryRun?: boolean,
 * }} options
 */
export async function importBlogger(
  db,
  {
    photoEntries,
    postEntries,
    blogEntries = [],
    rehost,
    slugs = {},
    dryRun = false,
  },
) {
  const photos = db.collection(COLLECTIONS.photos);
  const posts = db.collection(COLLECTIONS.posts);
  const report = { photos: [], posts: [], skipped: [] };
  // One upload per image, even when a post uses it twice (a cover that
  // also appears in the text), so the page can tell they're the same.
  const uploads = new Map();
  function host(src) {
    if (dryRun) return placeholderImage();
    if (!uploads.has(src)) uploads.set(src, rehost(src));
    return uploads.get(src);
  }

  const newestFirst = (a, b) => b.published.localeCompare(a.published);
  const photoItems = photoEntries.flatMap(photosFromEntry).sort(newestFirst);
  let order = await nextOrder(photos);
  for (const item of photoItems) {
    if (await photos.findOne({ id: item.id })) {
      report.skipped.push(`photo ${item.id}`);
      continue;
    }
    const doc = {
      id: item.id,
      order: order++,
      image: await host(item.src),
      alt: item.alt,
      caption: item.caption,
      album: item.album,
    };
    photoSchema.parse(doc);
    if (!dryRun) await photos.insertOne({ ...doc });
    report.photos.push(doc);
  }

  const postItems = [
    ...postEntries.map((entry) => postFromEntry(entry, slugs)),
    ...blogEntries.map((entry) =>
      postFromEntry(entry, slugs, { kind: "blog" }),
    ),
  ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  // Links between imported posts ("previous part") stay on this site.
  const sitePaths = postItems.map((item) => [
    `](${item.permalink})`,
    `](/writing/${item.slug})`,
  ]);
  order = await nextOrder(posts);
  for (const item of postItems) {
    if (await posts.findOne({ slug: item.slug })) {
      report.skipped.push(`post ${item.slug}`);
      continue;
    }
    let body = item.body;
    for (const [from, to] of sitePaths) body = body.split(from).join(to);
    for (const src of item.images) {
      const hosted = await host(fullSizeImageUrl(src));
      body = body.split(src).join(hosted.url);
    }
    const doc = {
      slug: item.slug,
      order: order++,
      title: item.title,
      excerpt: item.excerpt,
      body,
      tags: item.tags,
      status: item.status,
      publishedAt: item.publishedAt,
      ...(item.kind ? { kind: item.kind, originalUrl: item.originalUrl } : {}),
      ...(item.cover
        ? {
            cover: await host(item.cover),
            coverAlt: item.coverAlt,
          }
        : {}),
    };
    postSchema.parse(doc);
    if (!dryRun) await posts.insertOne({ ...doc });
    report.posts.push({
      ...doc,
      permalink: item.permalink,
      imageCount: item.images.length,
    });
  }

  return report;
}

function placeholderImage() {
  return {
    url: "https://dry-run.public.blob.vercel-storage.com/placeholder.jpg",
    width: 1,
    height: 1,
  };
}
