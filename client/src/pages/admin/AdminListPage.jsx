import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { LISTS } from "../../features/admin/admin-collections";
import { deleteListItem, reorderList } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { AdminPageHeader } from "./AdminPageHeader";

const ICON_BUTTON =
  "inline-grid size-10 place-items-center rounded-(--radius-sm) border border-(--color-border) text-(--color-text-secondary) hover:border-(--color-border-strong) hover:text-(--color-text-primary) disabled:opacity-35";

/**
 * A list section: items in display order with move up/down (unless the
 * list sorts itself, like posts by date), edit, and delete (confirmed
 * inline).
 * @param {{ name: keyof typeof LISTS }} props
 */
export function AdminListPage({ name }) {
  const { content, reload } = useAdmin();
  const config = LISTS[name];
  const sortable = config.sortable !== false;
  const items = [...(content[name] ?? [])].sort(
    sortable ? (a, b) => a.order - b.order : config.compare,
  );
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function run(action, message) {
    setBusy(true);
    try {
      await action();
      await reload();
      setStatus(message);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  function move(index, offset) {
    const keys = items.map((item) => item[config.keyField]);
    const [key] = keys.splice(index, 1);
    keys.splice(index + offset, 0, key);
    run(() => reorderList(name, keys), "Order saved.");
  }

  return (
    <>
      <AdminPageHeader
        title={config.label}
        description={config.description}
        actions={
          <ButtonLink
            to={`/admin/${name}/new`}
            leadingIcon={<Plus size={16} />}
          >
            Add {config.itemLabel}
          </ButtonLink>
        }
      />
      <p
        role="status"
        aria-live="polite"
        className="mb-3 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>
      {items.length === 0 ? (
        <p className="rounded-(--radius-lg) border border-dashed border-(--color-border-strong) p-6 text-center text-(--color-text-secondary)">
          No {config.label.toLowerCase()} yet.
        </p>
      ) : (
        <ol className="grid gap-2">
          {items.map((item, index) => {
            const key = item[config.keyField];
            const title = config.titleOf(item);
            const thumbnail = config.thumbnailOf?.(item);
            return (
              <li
                key={key}
                className="flex flex-wrap items-center gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-3 sm:flex-nowrap"
              >
                {sortable ? (
                  <span className="mono-meta w-6 text-center text-(--color-text-muted)">
                    {index + 1}
                  </span>
                ) : null}
                {thumbnail ? (
                  <img
                    src={thumbnail.url}
                    alt=""
                    width={thumbnail.width}
                    height={thumbnail.height}
                    loading="lazy"
                    className="size-12 shrink-0 rounded-(--radius-sm) border border-(--color-border) object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-semibold text-(--color-text-primary)">
                    {title}
                  </p>
                  <p className="truncate text-sm text-(--color-text-muted)">
                    {config.subtitleOf(item)}
                  </p>
                </div>
                {confirming === key ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-(--color-text-secondary)">
                      Delete?
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => deleteListItem(name, key),
                          `Deleted “${title}”.`,
                        )
                      }
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirming(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {sortable ? (
                      <>
                        <button
                          type="button"
                          className={ICON_BUTTON}
                          disabled={busy || index === 0}
                          onClick={() => move(index, -1)}
                          aria-label={`Move “${title}” up`}
                        >
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={ICON_BUTTON}
                          disabled={busy || index === items.length - 1}
                          onClick={() => move(index, 1)}
                          aria-label={`Move “${title}” down`}
                        >
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                      </>
                    ) : null}
                    <Link
                      to={`/admin/${name}/${encodeURIComponent(key)}`}
                      className={ICON_BUTTON}
                      aria-label={`Edit “${title}”`}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className={ICON_BUTTON}
                      disabled={busy}
                      onClick={() => setConfirming(key)}
                      aria-label={`Delete “${title}”`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
