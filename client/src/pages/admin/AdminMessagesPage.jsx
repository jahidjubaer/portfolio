import { useState } from "react";
import { Archive, ArchiveRestore, Mail, MailOpen, Trash2 } from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { deleteMessage, updateMessage } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import { ButtonLink } from "../../components/ui/ButtonLink";
import { cn } from "../../lib/cn";
import { AdminPageHeader } from "./AdminPageHeader";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** "Re: <subject>" reply in the visitor's mail app. */
function replyHref(message) {
  const params = new URLSearchParams({ subject: `Re: ${message.subject}` });
  return `mailto:${message.email}?${params.toString().replace(/\+/g, "%20")}`;
}

function MessageCard({ message, onChange, onDelete, busy }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <article
      className={cn(
        "rounded-(--radius-lg) border bg-(--color-surface) p-4",
        message.read
          ? "border-(--color-border)"
          : "border-(--color-accent-primary)/50",
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-semibold text-(--color-text-primary)">
          {message.read ? null : (
            <span className="mr-2 inline-block size-2 rounded-full bg-(--color-accent-primary) align-middle">
              <span className="sr-only">Unread: </span>
            </span>
          )}
          {message.subject}
        </h2>
        <p className="mono-meta text-(--color-text-muted)">
          {formatDateTime(message.receivedAt)}
        </p>
      </header>
      <p className="mt-1 text-sm text-(--color-text-secondary)">
        {message.name} ·{" "}
        <a
          href={`mailto:${message.email}`}
          className="underline underline-offset-4"
        >
          {message.email}
        </a>
      </p>
      <p className="mt-3 text-[0.9375rem] whitespace-pre-line text-(--color-text-primary)">
        {message.message}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ButtonLink
          href={replyHref(message)}
          size="sm"
          leadingIcon={<Mail size={15} />}
          onClick={() => !message.read && onChange({ read: true })}
        >
          Reply
        </ButtonLink>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          leadingIcon={
            message.read ? <Mail size={15} /> : <MailOpen size={15} />
          }
          onClick={() => onChange({ read: !message.read })}
        >
          {message.read ? "Mark unread" : "Mark read"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          leadingIcon={
            message.archived ? (
              <ArchiveRestore size={15} />
            ) : (
              <Archive size={15} />
            )
          }
          onClick={() => onChange({ archived: !message.archived, read: true })}
        >
          {message.archived ? "Move to inbox" : "Archive"}
        </Button>
        {confirming ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              className="text-(--color-danger)"
              onClick={onDelete}
            >
              Delete for good
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            leadingIcon={<Trash2 size={15} />}
            aria-label={`Delete the message from ${message.name}`}
            onClick={() => setConfirming(true)}
          >
            Delete
          </Button>
        )}
      </div>
    </article>
  );
}

/**
 * Contact-form inbox. Messages also arrive by email (Web3Forms); this is
 * the record that doesn't depend on the mailbox.
 */
export function AdminMessagesPage() {
  const { content, reload } = useAdmin();
  const [view, setView] = useState("inbox");
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState("");
  const all = content.messages ?? [];
  const archivedCount = all.filter((message) => message.archived).length;
  const shown = all.filter((message) =>
    view === "archived" ? message.archived : !message.archived,
  );

  async function run(id, action, done) {
    setBusyId(id);
    try {
      await action();
      await reload();
      setStatus(done);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Sent through the contact form. They also arrive by email."
      />
      <div
        role="group"
        aria-label="Show"
        className="mb-4 inline-flex rounded-(--radius-md) border border-(--color-border) p-1"
      >
        {[
          ["inbox", `Inbox (${all.length - archivedCount})`],
          ["archived", `Archived (${archivedCount})`],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={view === id}
            onClick={() => setView(id)}
            className={cn(
              "min-h-11 rounded-(--radius-sm) px-4 text-sm",
              view === id
                ? "bg-(--color-surface-raised) font-semibold text-(--color-text-primary)"
                : "text-(--color-text-secondary)",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p
        role="status"
        aria-live="polite"
        className="mb-3 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>
      {shown.length === 0 ? (
        <p className="rounded-(--radius-lg) border border-dashed border-(--color-border-strong) p-6 text-center text-(--color-text-secondary)">
          {view === "archived" ? "Nothing archived." : "No messages yet."}
        </p>
      ) : (
        <ul className="grid gap-3">
          {shown.map((message) => (
            <li key={message.id}>
              <MessageCard
                message={message}
                busy={busyId === message.id}
                onChange={(changes) =>
                  run(
                    message.id,
                    () => updateMessage(message.id, changes),
                    "Updated.",
                  )
                }
                onDelete={() =>
                  run(
                    message.id,
                    () => deleteMessage(message.id),
                    "Message deleted.",
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
