import { useId, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useAdmin } from "../admin-context";
import { createListItem } from "../admin-api";
import { slugify } from "../admin-collections";
import { INPUT, SMALL_BUTTON } from "./MediaFields";
import { cn } from "../../../lib/cn";

/**
 * "New organization" under an organization picker: adds one with just a
 * name (and optionally a link) without leaving the form, then selects it.
 * The logo can be added later under Organizations.
 * @param {{ onCreated: (id: string) => void }} props
 */
export function QuickAddOrganization({ onCreated }) {
  const { reload } = useAdmin();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef(null);

  function openForm() {
    setOpen(true);
    setStatus("");
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      setStatus("Type the organization's name.");
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    setStatus("Adding…");
    try {
      const organizationId = slugify(trimmed);
      await createListItem("organizations", {
        id: organizationId,
        name: trimmed,
        ...(url.trim() ? { url: url.trim() } : {}),
      });
      await reload();
      onCreated(organizationId);
      setStatus(`Added “${trimmed}” and selected it.`);
      setOpen(false);
      setName("");
      setUrl("");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  // Enter adds the organization instead of submitting the whole form.
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      add();
    }
    if (event.key === "Escape") setOpen(false);
  }

  return (
    <div className="grid gap-2">
      {open ? (
        <div
          role="group"
          aria-label="New organization"
          className="grid gap-2 rounded-(--radius-sm) border border-dashed border-(--color-border-strong) p-3"
        >
          <label htmlFor={`${id}-name`} className="text-sm font-semibold">
            New organization&apos;s name
          </label>
          <input
            ref={nameRef}
            id={`${id}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={handleKeyDown}
            className={INPUT}
          />
          <label htmlFor={`${id}-url`} className="text-sm font-semibold">
            Website{" "}
            <span className="font-normal text-(--color-text-muted)">
              optional
            </span>
          </label>
          <input
            id={`${id}-url`}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://"
            className={INPUT}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={add}
              disabled={busy}
              className={SMALL_BUTTON}
            >
              Add organization
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={SMALL_BUTTON}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openForm}
          className={cn(SMALL_BUTTON, "justify-self-start")}
        >
          <Plus size={14} aria-hidden="true" />
          New organization
        </button>
      )}
      <p
        role="status"
        aria-live="polite"
        className="text-xs text-(--color-text-secondary)"
      >
        {status}
      </p>
    </div>
  );
}
