import { cn } from "../../lib/cn";
import { detectTextLanguage } from "../../lib/language";

/**
 * A book's cover (copied to Blob by the sync), or a printed cover with the
 * title when Goodreads has none. Always 2:3, so the shelf never jumps.
 * @param {{ book: import("../../data/books").Book, className?: string }} props
 */
export function BookCover({ book, className }) {
  const frame = cn(
    "aspect-[2/3] w-full overflow-hidden rounded-[3px] border border-(--color-border) shadow-[2px_3px_0_0_var(--color-border)]",
    className,
  );
  if (book.cover) {
    return (
      <img
        src={book.cover.url}
        alt=""
        width={120}
        height={180}
        loading="lazy"
        decoding="async"
        className={cn(frame, "bg-(--color-surface-raised) object-cover")}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        frame,
        "flex flex-col justify-between bg-(--color-surface-raised) p-2 text-left",
      )}
    >
      <span
        lang={detectTextLanguage(book.title)}
        className="line-clamp-5 text-[0.75rem] leading-snug font-semibold text-(--color-text-primary)"
      >
        {book.title}
      </span>
      <span
        lang={detectTextLanguage(book.author)}
        className="line-clamp-2 text-[0.6875rem] text-(--color-text-muted)"
      >
        {book.author}
      </span>
    </span>
  );
}

/** Jahid's own rating as stars, in words for screen readers. */
export function BookRating({ rating }) {
  if (!rating) return null;
  return (
    <span className="block text-[0.75rem] text-(--color-accent-primary)">
      <span aria-hidden="true">
        {"★".repeat(rating)}
        <span className="text-(--color-border-strong)">
          {"★".repeat(5 - rating)}
        </span>
      </span>
      <span className="sr-only">Rated {rating} of 5</span>
    </span>
  );
}
