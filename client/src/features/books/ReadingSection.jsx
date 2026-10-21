import { useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { cn } from "../../lib/cn";
import { detectTextLanguage } from "../../lib/language";
import { readingStats, shelfTags } from "../../data/books";
import { BookCover, BookRating } from "./BookCover";

// Books on the shelf before "Show all".
const SHELF_PREVIEW = 18;

const CHIP =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors";

/** Cover, title, author, and rating, linked to the book on Goodreads. */
function BookCard({ book }) {
  return (
    <a
      href={book.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-(--radius-sm)"
    >
      <BookCover
        book={book}
        className="block transition-transform group-hover:-translate-y-1 motion-reduce:transition-none"
      />
      <span
        lang={detectTextLanguage(book.title)}
        className="mt-2 line-clamp-2 text-[0.875rem] leading-snug font-semibold text-(--color-text-primary) group-hover:underline"
      >
        {book.title}
      </span>
      <span
        lang={detectTextLanguage(book.author)}
        className="mt-0.5 line-clamp-1 text-[0.8125rem] text-(--color-text-secondary)"
      >
        {book.author}
      </span>
      <BookRating rating={book.rating} />
      <span className="sr-only"> (Goodreads, opens in a new tab)</span>
    </a>
  );
}

/**
 * Beyond's Reading section (R4): what's being read now, real counts, and
 * the read shelf with a filter by Goodreads shelf tag.
 * @param {{ books: NonNullable<import("../../data/books").books> }} props
 */
export function ReadingSection({ books }) {
  const [tag, setTag] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const stats = readingStats(books.read);
  const favorites = books.read.filter((book) => book.favorite).length;
  const filters = [
    { id: null, label: "All" },
    ...(favorites >= 2 ? [{ id: "favorites", label: "Favourites" }] : []),
    ...shelfTags(books.read).map((item) => ({
      id: item.tag,
      label: item.label,
    })),
  ];
  const shelf = books.read.filter((book) => {
    if (tag === "favorites") return book.favorite;
    return !tag || book.tags.includes(tag);
  });
  const shown = showAll ? shelf : shelf.slice(0, SHELF_PREVIEW);

  function chooseTag(id) {
    setTag(id);
    setShowAll(false);
  }

  return (
    <div className="grid gap-10">
      {books.currentlyReading.length ? (
        <div>
          <h3 className="mono-meta text-(--color-accent-primary)">
            ▸ Currently reading
          </h3>
          <ul className="mt-4 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
            {books.currentlyReading.map((book) => (
              <li key={book.bookId}>
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {stats.count ? (
        <div>
          <h3 className="mono-meta text-(--color-text-secondary)">
            Read · {stats.count} books
            {stats.pages
              ? `, ${stats.pages.toLocaleString("en-US")} pages`
              : ""}
          </h3>
          {stats.years.length ? (
            <p className="mt-1 text-[0.875rem] text-(--color-text-muted)">
              {stats.years
                .map((item) => `${item.year}: ${item.count}`)
                .join(" · ")}
              {stats.undated
                ? ` · read date not recorded: ${stats.undated}`
                : ""}
            </p>
          ) : null}

          {filters.length > 1 ? (
            <div
              role="group"
              aria-label="Filter the shelf"
              className="mt-4 flex flex-wrap gap-2"
            >
              {filters.map((filter) => (
                <button
                  key={filter.id ?? "all"}
                  type="button"
                  aria-pressed={tag === filter.id}
                  onClick={() => chooseTag(filter.id)}
                  className={cn(
                    CHIP,
                    tag === filter.id
                      ? "border-(--color-accent-primary) bg-(--color-accent-primary-soft) text-(--color-text-primary)"
                      : "border-(--color-border) text-(--color-text-secondary) hover:border-(--color-border-strong) hover:text-(--color-text-primary)",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          ) : null}

          <ul className="mt-5 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
            {shown.map((book) => (
              <li key={book.bookId}>
                <BookCard book={book} />
              </li>
            ))}
          </ul>
          {shelf.length > shown.length ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className={cn(
                CHIP,
                "mt-6 border-(--color-border) text-(--color-text-primary) hover:border-(--color-border-strong)",
              )}
            >
              Show all {shelf.length} books
            </button>
          ) : null}
        </div>
      ) : null}

      <a
        href={books.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center gap-2 justify-self-start text-[0.9375rem] font-medium text-(--color-text-primary) underline decoration-(--color-border-strong) underline-offset-4 hover:decoration-(--color-accent-primary)"
      >
        <BookOpen size={16} aria-hidden="true" />
        My shelves on Goodreads
        <ArrowUpRight size={14} aria-hidden="true" className="opacity-60" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
