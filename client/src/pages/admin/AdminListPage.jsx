import { useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { LISTS } from "../../features/admin/admin-collections";
import { deleteListItem, reorderList } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { AdminPageHeader } from "./AdminPageHeader";
import { INPUT } from "../../features/admin/form/MediaFields";
import { cn } from "../../lib/cn";

// Below this many items a search box is just clutter.
const SEARCH_FROM = 7;

const ICON_BUTTON =
  "inline-grid size-10 place-items-center rounded-(--radius-sm) border border-(--color-border) text-(--color-text-secondary) hover:border-(--color-border-strong) hover:text-(--color-text-primary) disabled:opacity-35";

/**
 * A list section: items in display order with drag-and-drop and move
 * up/down buttons (unless the list sorts itself, like posts by date), a
 * search box for long lists, edit, and delete (confirmed inline).
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
  const [query, setQuery] = useState("");
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const searchId = useId();
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? items.filter((item) =>
        `${config.titleOf(item, content)} ${config.subtitleOf(item, content)}`
          .toLowerCase()
          .includes(needle),
      )
    : items;
  // Reordering a filtered list would be ambiguous, so it waits.
  const canReorder = sortable && !needle;
  const QuickAdd = config.quickAdd;

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

  function moveTo(from, to) {
    if (from === to) return;
    const keys = items.map((item) => item[config.keyField]);
    const [key] = keys.splice(from, 1);
    keys.splice(to, 0, key);
    run(() => reorderList(name, keys), "Order saved.");
  }

  function move(index, offset) {
    moveTo(index, index + offset);
  }

  function handleDrop(index) {
    if (dragFrom !== null) moveTo(dragFrom, index);
    setDragFrom(null);
    setDragOver(null);
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
      {QuickAdd ? <QuickAdd /> : null}
      <p
        role="status"
        aria-live="polite"
        className="mb-3 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>
      {items.length >= SEARCH_FROM ? (
        <div className="relative mb-3">
          <label htmlFor={searchId} className="sr-only">
            Search {config.label.toLowerCase()}
          </label>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--color-text-muted)"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            className={cn(INPUT, "pl-9")}
          />
        </div>
      ) : null}
      {needle && visible.length === 0 ? (
        <p className="text-sm text-(--color-text-secondary)">
          Nothing matches “{query}”.
        </p>
      ) : null}
      {items.length === 0 ? (
        <p className="rounded-(--radius-lg) border border-dashed border-(--color-border-strong) p-6 text-center text-(--color-text-secondary)">
          No {config.label.toLowerCase()} yet.
        </p>
      ) : (
        <ol className="grid gap-2">
          {visible.map((item, index) => {
            const key = item[config.keyField];
            const title = config.titleOf(item, content);
            const thumbnail = config.thumbnailOf?.(item);
            return (
              <li
                key={key}
                draggable={canReorder && !busy}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDragFrom(index);
                }}
                onDragOver={(event) => {
                  if (dragFrom === null) return;
                  event.preventDefault();
                  setDragOver(index);
                }}
                onDragEnd={() => {
                  setDragFrom(null);
                  setDragOver(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(index);
                }}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-(--radius-lg) border bg-(--color-surface) p-3 transition-colors sm:flex-nowrap",
                  dragOver === index && dragFrom !== index
                    ? "border-(--color-accent-primary)"
                    : "border-(--color-border)",
                  dragFrom === index && "opacity-50",
                )}
              >
                {canReorder ? (
                  <span
                    aria-hidden="true"
                    title="Drag to reorder"
                    className="flex cursor-grab items-center gap-1 text-(--color-text-muted) active:cursor-grabbing"
                  >
                    <GripVertical size={16} />
                    <span className="mono-meta w-5 text-center">
                      {index + 1}
                    </span>
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
                  <p className="flex items-center gap-1.5 font-semibold text-(--color-text-primary)">
                    {config.isPrivate?.(item) ? (
                      <Lock
                        size={14}
                        aria-label="Private"
                        role="img"
                        className="shrink-0 text-(--color-text-muted)"
                      />
                    ) : null}
                    <span className="truncate">{title}</span>
                  </p>
                  <p className="truncate text-sm text-(--color-text-muted)">
                    {config.subtitleOf(item, content)}
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
                    {canReorder ? (
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
