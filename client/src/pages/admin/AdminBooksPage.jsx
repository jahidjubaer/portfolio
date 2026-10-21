import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { setBookHidden, syncBooks } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import { BookCover } from "../../features/books/BookCover";
import { detectTextLanguage } from "../../lib/language";
import { AdminPageHeader } from "./AdminPageHeader";

const SHELF_LABELS = {
  "currently-reading": "Currently reading",
  read: "Read",
};

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * The Goodreads shelves as synced (R4): sync now, and hide any book from
 * the Beyond page. The books themselves are edited on Goodreads.
 */
export function AdminBooksPage() {
  const { content, reload } = useAdmin();
  const { books = [], sync = null } = content.bookStatus ?? {};
  const hasUserId = Boolean(content.beyond?.goodreadsUserId);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function run(task, message) {
    setBusy(true);
    try {
      await task();
      await reload();
      setStatus(message);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  const errors = Object.entries(sync?.errors ?? {});

  return (
    <>
      <AdminPageHeader
        title="Books"
        description="Your Goodreads shelves for the Beyond page. Edit books on Goodreads; hide any here."
        actions={
          <Button
            onClick={() => run(syncBooks, "Books synced.")}
            disabled={busy || !hasUserId}
            leadingIcon={<RefreshCw size={16} />}
          >
            Sync now
          </Button>
        }
      />
      <div className="mb-4 grid gap-2 text-sm text-(--color-text-secondary)">
        {hasUserId ? (
          <p>
            {sync?.lastSyncAt
              ? `Last synced ${formatDateTime(sync.lastSyncAt)} · ${books.length} books. Syncs again every day; publish to show changes.`
              : "Not synced yet. Press “Sync now” to load your shelves."}
          </p>
        ) : (
          <p>
            Add your Goodreads user ID under{" "}
            <Link
              to="/admin/beyond"
              className="font-semibold text-(--color-text-primary) underline underline-offset-4"
            >
              Beyond
            </Link>{" "}
            first.
          </p>
        )}
        {errors.map(([shelf, message]) => (
          <p key={shelf} className="text-(--color-danger)">
            {SHELF_LABELS[shelf] ?? shelf}: {message} The last good copy is
            kept.
          </p>
        ))}
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mb-3 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>
      {books.length ? (
        <ul className="grid gap-2">
          {books.map((book) => (
            <li
              key={book.bookId}
              className="flex items-center gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-3"
            >
              <BookCover book={book} className="w-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <p
                  lang={detectTextLanguage(book.title)}
                  className="truncate font-semibold text-(--color-text-primary)"
                >
                  {book.title}
                </p>
                <p className="truncate text-sm text-(--color-text-muted)">
                  {[
                    SHELF_LABELS[book.shelf],
                    book.author,
                    book.readAt ? `read ${book.readAt}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <label className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-(--color-text-secondary)">
                <input
                  type="checkbox"
                  checked={book.hidden}
                  disabled={busy}
                  onChange={(event) =>
                    run(
                      () => setBookHidden(book.bookId, event.target.checked),
                      event.target.checked
                        ? `Hid “${book.title}”.`
                        : `“${book.title}” shows again.`,
                    )
                  }
                  className="size-4 accent-(--color-accent-primary)"
                />
                Hide
                <span className="sr-only"> “{book.title}”</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
