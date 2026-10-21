import { posts as storedPosts } from "../generated/content.json";

/**
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   excerpt: string,
 *   body: string,
 *   tags: string[],
 *   publishedAt: string,
 *   cover?: { url: string, width: number, height: number },
 *   coverAlt?: string,
 *   kind?: "notes" | "blog",
 *   originalUrl?: string,
 * }} Post
 */

/**
 * Published posts from the content snapshot (drafts never reach it),
 * newest first.
 * @param {Post[]} list
 * @returns {Post[]}
 */
export function sortPosts(list) {
  return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const posts = sortPosts(storedPosts);

/**
 * The personal Bangla blog (docs/14 R5) has its own list on /writing; every
 * other post is a learning note.
 * @param {Post} post
 */
export function isBlogPost(post) {
  return post.kind === "blog";
}

/**
 * "2020–2022", or "2021" when every post is from one year.
 * @param {Post[]} list
 */
export function yearSpan(list) {
  const years = list.map((post) => post.publishedAt.slice(0, 4)).sort();
  if (years.length === 0) return "";
  const [first, last] = [years[0], years[years.length - 1]];
  return first === last ? first : `${first}–${last}`;
}

/**
 * "Blogger" for a blogspot.com address, else the host name.
 * @param {string} url
 */
export function originalSiteName(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return host.endsWith(".blogspot.com") ? "Blogger" : host;
}

/** @param {string} slug */
export function getPost(slug) {
  return posts.find((post) => post.slug === slug) ?? null;
}

/**
 * "2025-09-12" → "September 12, 2025". Parsed as a calendar date, so
 * every reader sees the same day.
 * @param {string} isoDate
 */
export function formatPostDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
