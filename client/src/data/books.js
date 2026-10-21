import { books as storedBooks } from "../generated/content.json";

/**
 * @typedef {{
 *   bookId: string,
 *   title: string,
 *   author: string,
 *   url: string,
 *   cover: { url: string } | null,
 *   pages: number | null,
 *   published: number | null,
 *   rating: number | null,
 *   readAt: string | null,
 *   addedAt: string | null,
 *   tags: string[],
 *   favorite: boolean,
 * }} Book
 */

/**
 * Books from the Goodreads sync (R4), or null before the first sync.
 * Hidden books and the "to-read" shelf never reach the snapshot.
 * @type {{ profileUrl: string, syncedAt: string, currentlyReading: Book[], read: Book[] } | null}
 */
export const books = storedBooks ?? null;

/**
 * Real counts only: books and known pages, and books per year from the
 * read dates Goodreads has. Books without one are counted as "date not
 * recorded", never as this year.
 * @param {Book[]} read
 */
export function readingStats(read) {
  const perYear = new Map();
  let undated = 0;
  for (const book of read) {
    if (book.readAt) {
      const year = book.readAt.slice(0, 4);
      perYear.set(year, (perYear.get(year) ?? 0) + 1);
    } else {
      undated += 1;
    }
  }
  return {
    count: read.length,
    pages: read.reduce((sum, book) => sum + (book.pages ?? 0), 0),
    years: [...perYear]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, count]) => ({ year, count })),
    undated,
  };
}

/**
 * The shelf tags worth filtering by: used on at least two books, most
 * used first. "programming-engineering" reads "Programming engineering".
 * @param {Book[]} read
 * @param {number} [limit]
 */
export function shelfTags(read, limit = 6) {
  const counts = new Map();
  for (const book of read) {
    for (const tag of book.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count, label: tagLabel(tag) }));
}

/** "historical-fiction" → "Historical fiction" */
export function tagLabel(tag) {
  const words = tag.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
