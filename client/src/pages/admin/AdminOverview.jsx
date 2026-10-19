import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Info } from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { ADMIN_SECTIONS, LISTS } from "../../features/admin/admin-collections";
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

/** Admin home: what's in the database and where to edit it. */
export function AdminOverview() {
  const { admin, content } = useAdmin();
  return (
    <>
      <AdminPageHeader
        title={`Welcome, @${admin.login}`}
        description="Edit your portfolio content."
      />
      <PublishStatus publishing={content.publishing} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {ADMIN_SECTIONS.map((section) => {
          let count = null;
          if (LISTS[section.path]) {
            count = content[section.path]?.length ?? 0;
          } else if (section.path === "repositories") {
            count = content.repositories.repos.filter(
              (repo) => !repo.fork,
            ).length;
          }
          const warnings =
            section.path === "repositories"
              ? content.repositories.warnings.length
              : 0;
          return (
            <li key={section.path}>
              <Link
                to={`/admin/${section.path}`}
                className="group flex h-full items-start justify-between gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-border-strong)"
              >
                <span>
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
                  {warnings > 0 ? (
                    <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-(--color-danger)">
                      <AlertTriangle size={15} aria-hidden="true" />
                      {warnings === 1
                        ? "1 project link needs attention"
                        : `${warnings} project links need attention`}
                    </span>
                  ) : null}
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
    </>
  );
}
