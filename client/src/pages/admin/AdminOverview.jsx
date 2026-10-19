import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
} from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { ADMIN_GROUPS } from "../../features/admin/admin-collections";
import {
  getAttentionItems,
  sectionCount,
} from "../../features/admin/attention";
import { AdminPageHeader } from "./AdminPageHeader";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Whether the public site is up to date, and the latest publishes. */
function PublishStatus({ publishing }) {
  let summary = "Nothing has been published from here yet.";
  if (publishing.hasUnpublishedChanges) {
    summary = `You have changes since ${publishing.lastPublishAt ? `the last publish (${formatDateTime(publishing.lastPublishAt)})` : "the site was last built"}. Press Publish to put them on the site.`;
  } else if (publishing.lastPublishAt) {
    summary = `Everything is published (last publish ${formatDateTime(publishing.lastPublishAt)}).`;
  }
  return (
    <section
      aria-labelledby="publish-status"
      className="mb-6 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4 text-sm text-(--color-text-secondary)"
    >
      <h2
        id="publish-status"
        className="flex items-center gap-2 font-semibold text-(--color-text-primary)"
      >
        <Info
          size={17}
          aria-hidden="true"
          className="text-(--color-accent-primary)"
        />
        Publishing
      </h2>
      <p className="mt-2">
        Saving updates the database right away. <strong>Publish</strong>{" "}
        rebuilds the public site from it, which takes about 2 minutes.
      </p>
      <p className="mt-1">{summary}</p>
      {publishing.configured ? null : (
        <p className="mt-1 text-(--color-danger)">
          Publishing isn&apos;t set up yet: add a Vercel Deploy Hook as{" "}
          <code>VERCEL_DEPLOY_HOOK_URL</code>.
        </p>
      )}
      {publishing.history.length > 0 ? (
        <ul className="mt-3 grid gap-1">
          {publishing.history.map((entry) => (
            <li key={entry.at}>
              {formatDateTime(entry.at)} · @{entry.by} ·{" "}
              {entry.ok ? (
                "started"
              ) : (
                <span className="text-(--color-danger)">
                  failed: {entry.error}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Fixes first, then suggestions, each linking to where it's done. */
function AttentionList({ items }) {
  return (
    <section aria-labelledby="attention-heading" className="mb-8">
      <h2
        id="attention-heading"
        className="mb-3 text-[1.0625rem] font-semibold text-(--color-text-primary)"
      >
        Needs attention
      </h2>
      {items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-(--color-text-secondary)">
          <CheckCircle2
            size={17}
            aria-hidden="true"
            className="text-(--color-success)"
          />
          Nothing to fix. Everything looks complete.
        </p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => {
            const isFix = item.tone === "fix";
            const Icon = isFix ? AlertTriangle : Lightbulb;
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="group flex items-start gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) p-3 text-sm transition-colors hover:border-(--color-border-strong)"
                >
                  <Icon
                    size={17}
                    aria-hidden="true"
                    className={
                      isFix
                        ? "mt-0.5 shrink-0 text-(--color-warning)"
                        : "mt-0.5 shrink-0 text-(--color-text-muted)"
                    }
                  />
                  <span className="flex-1 text-(--color-text-secondary)">
                    <span className="sr-only">
                      {isFix ? "To fix: " : "Suggestion: "}
                    </span>
                    {item.message}
                  </span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-(--color-text-muted) group-hover:text-(--color-text-primary)"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Admin home: publishing, what needs attention, and every section. */
export function AdminOverview() {
  const { admin, content } = useAdmin();
  const attention = getAttentionItems(content);
  const order = { fix: 0, suggestion: 1 };
  attention.sort((a, b) => order[a.tone] - order[b.tone]);
  return (
    <>
      <AdminPageHeader
        title={`Welcome, @${admin.login}`}
        description="Edit your portfolio content."
      />
      <PublishStatus publishing={content.publishing} />
      <AttentionList items={attention} />
      {ADMIN_GROUPS.map((group) => (
        <section
          key={group.label}
          aria-labelledby={`overview-${group.label}`}
          className="mb-6"
        >
          <h2
            id={`overview-${group.label}`}
            className="mono-meta mb-2 text-(--color-text-muted)"
          >
            {group.label}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {group.sections.map((section) => {
              const Icon = section.icon;
              const count = sectionCount(section.path, content);
              return (
                <li key={section.path}>
                  <Link
                    to={`/admin/${section.path}`}
                    className="group flex h-full items-start gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-border-strong)"
                  >
                    <Icon
                      size={19}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-(--color-text-secondary)"
                    />
                    <span className="flex-1">
                      <span className="block font-semibold text-(--color-text-primary)">
                        {section.label}
                        {count !== null ? (
                          <span className="ml-2 font-normal text-(--color-text-muted)">
                            {count}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm text-(--color-text-secondary)">
                        {section.description}
                      </span>
                    </span>
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-(--color-text-muted) group-hover:text-(--color-text-primary)"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
