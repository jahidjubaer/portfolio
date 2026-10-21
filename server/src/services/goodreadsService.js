import { put } from "@vercel/blob";
import { env } from "../config/env.js";
import { getDb } from "../db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../db/collections.js";

/**
 * Books from Jahid's public Goodreads shelves (R4), synced daily with the
 * GitHub and coding stats. Goodreads has no API any more, but each shelf
 * has a public RSS feed. Only "read" and "currently-reading" are synced;
 * "to-read" stays off the site (docs/14, D5). Covers are copied to Vercel
 * Blob, because the site's CSP only allows its own image hosts and
 * Goodreads' URLs aren't stable.
 */

const HIDE_ID = { projection: { _id: 0 } };
const TIMEOUT_MS = 15_000;
export const SHELVES = ["currently-reading", "read"];
// Goodreads' own shelf tags that say nothing about the book.
const IGNORED_TAGS = new Set(["favorites", "not-collected"]);

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text) {
  return text
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1")
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, code) => {
      if (code[0] !== "#") return ENTITIES[code] ?? match;
      const value =
        code[1].toLowerCase() === "x"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isNaN(value) ? match : String.fromCodePoint(value);
    })
    .trim();
}

function field(item, tag) {
  const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? decode(match[1].trim()) : "";
}

/** "Tue, 19 May 2026 00:00:00 +0000" → "2026-05-19", or null. */
function isoDay(text) {
  if (!text) return null;
  const time = Date.parse(text);
  return Number.isNaN(time) ? null : new Date(time).toISOString().slice(0, 10);
}

const positive = (text) => {
  const value = Number.parseInt(text, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
};

/**
 * The books in one shelf's RSS feed. Pure, so tests feed it saved XML.
 * @param {string} xml
 * @param {string} shelf
 */
export function parseGoodreadsRss(xml, shelf) {
  if (!/<rss[\s>]/.test(xml)) {
    throw httpError(502, "Goodreads didn't answer with a feed.");
  }
  return xml
    .split("<item>")
    .slice(1)
    .map((item) => {
      const id = field(item, "book_id");
      const image = field(item, "book_large_image_url");
      const tags = field(item, "user_shelves")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      return {
        bookId: id,
        shelf,
        title: field(item, "title"),
        author: field(item, "author_name"),
        url: `https://www.goodreads.com/book/show/${id}`,
        // Goodreads' "no photo" placeholder isn't a cover.
        coverSource: image && !image.includes("/nophoto/") ? image : null,
        pages: positive(field(item, "num_pages")),
        published: positive(field(item, "book_published")),
        rating: positive(field(item, "user_rating")),
        // Only the date Jahid entered; the date added isn't a read date.
        readAt: isoDay(field(item, "user_read_at")),
        addedAt: isoDay(field(item, "user_date_added")),
        tags: tags.filter((tag) => !IGNORED_TAGS.has(tag)),
        favorite: tags.includes("favorites"),
      };
    })
    .filter((book) => /^\d+$/.test(book.bookId) && book.title);
}

async function fetchShelf(userId, shelf) {
  const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&per_page=200`;
  let response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw httpError(502, "Couldn't reach Goodreads.");
  }
  if (!response.ok) {
    throw httpError(502, `Goodreads answered ${response.status}.`);
  }
  return parseGoodreadsRss(await response.text(), shelf);
}

/**
 * Copies a cover to Blob under a fixed name per book. Returns null when
 * uploads aren't configured or the download fails; the book shows a
 * printed spine instead.
 */
async function copyCover(book) {
  if (!env.blobToken || !book.coverSource) return null;
  try {
    const response = await fetch(book.coverSource, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return null;
    const blob = await put(
      `books/${book.bookId}.jpg`,
      Buffer.from(await response.arrayBuffer()),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType,
        token: env.blobToken,
      },
    );
    return { url: blob.url };
  } catch (error) {
    console.warn("Couldn't copy the cover of", book.bookId, error.message);
    return null;
  }
}

/**
 * Refreshes both shelves. A shelf that fails keeps its last good books
 * (and records the error); a book's "hidden" flag and its copied cover
 * are kept across syncs, and a cover is only copied again when Goodreads'
 * image changes.
 * @param {string} userId Goodreads' numeric user id
 * @param {{ fetchShelf?: typeof fetchShelf, copyCover?: typeof copyCover }} [deps]
 */
export async function syncBooks(userId, deps = {}) {
  const loadShelf = deps.fetchShelf ?? fetchShelf;
  const storeCover = deps.copyCover ?? copyCover;
  const db = await getDb();
  const books = db.collection(COLLECTIONS.books);
  const attemptedAt = new Date().toISOString();
  const errors = {};
  const existing = new Map(
    (await books.find({}, HIDE_ID).toArray()).map((book) => [
      book.bookId,
      book,
    ]),
  );

  const seen = new Set();
  const synced = [];
  for (const shelf of SHELVES) {
    let fetched;
    try {
      fetched = await loadShelf(userId, shelf);
    } catch (error) {
      errors[shelf] = error.message;
      continue;
    }
    synced.push(shelf);
    for (const book of fetched) {
      seen.add(book.bookId);
      const previous = existing.get(book.bookId);
      const cover =
        previous?.cover && previous.coverSource === book.coverSource
          ? previous.cover
          : await storeCover(book);
      await books.replaceOne(
        { bookId: book.bookId },
        {
          ...book,
          cover,
          hidden: previous?.hidden ?? false,
          syncedAt: attemptedAt,
        },
        { upsert: true },
      );
    }
  }
  // Gone from a shelf that synced, and not moved to another shelf. A
  // shelf that failed keeps its books.
  await books.deleteMany({
    shelf: { $in: synced },
    bookId: { $nin: [...seen] },
  });

  const state = {
    userId,
    lastAttemptAt: attemptedAt,
    errors,
    ...(synced.length ? { lastSyncAt: attemptedAt } : {}),
  };
  await db
    .collection(COLLECTIONS.bookSync)
    .updateOne({ _id: SINGLETON_ID }, { $set: state }, { upsert: true });
  return { count: await books.countDocuments(), errors };
}

/** Every synced book (hidden ones too) and the last sync, for the admin. */
export async function getBooksStatus() {
  const db = await getDb();
  const [books, sync] = await Promise.all([
    db
      .collection(COLLECTIONS.books)
      .find({}, HIDE_ID)
      .sort({ shelf: 1, readAt: -1, addedAt: -1 })
      .toArray(),
    db.collection(COLLECTIONS.bookSync).findOne({ _id: SINGLETON_ID }, HIDE_ID),
  ]);
  return { books, sync };
}

/**
 * Hides a book from the site (or shows it again).
 * @param {string} bookId
 * @param {unknown} hidden
 */
export async function setBookHidden(bookId, hidden) {
  if (typeof hidden !== "boolean") {
    throw httpError(400, "Send { hidden: true | false }.");
  }
  const db = await getDb();
  const result = await db
    .collection(COLLECTIONS.books)
    .findOneAndUpdate(
      { bookId },
      { $set: { hidden } },
      { ...HIDE_ID, returnDocument: "after" },
    );
  if (!result) throw httpError(404, "Book not found.");
  return result;
}

const byRecentlyRead = (a, b) =>
  (b.readAt ?? "").localeCompare(a.readAt ?? "") ||
  (b.addedAt ?? "").localeCompare(a.addedAt ?? "");

function toPublicBook(book) {
  const rest = { ...book };
  delete rest.hidden;
  delete rest.coverSource;
  delete rest.syncedAt;
  delete rest.shelf;
  return rest;
}

/**
 * The visible books for the public snapshot, or null before the first
 * successful sync.
 */
export async function getBooksSnapshot() {
  const { books, sync } = await getBooksStatus();
  if (!sync?.lastSyncAt) return null;
  const visible = books.filter((book) => !book.hidden).sort(byRecentlyRead);
  return {
    profileUrl: `https://www.goodreads.com/user/show/${sync.userId}`,
    syncedAt: sync.lastSyncAt,
    currentlyReading: visible
      .filter((book) => book.shelf === "currently-reading")
      .map(toPublicBook),
    read: visible.filter((book) => book.shelf === "read").map(toPublicBook),
  };
}
