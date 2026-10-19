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
