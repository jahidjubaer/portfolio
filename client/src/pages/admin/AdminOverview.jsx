import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Info } from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { ADMIN_SECTIONS, LISTS } from "../../features/admin/admin-collections";
import { AdminPageHeader } from "./AdminPageHeader";

/** Admin home: what's in the database and where to edit it. */
export function AdminOverview() {
  const { admin, content } = useAdmin();
  return (
    <>
      <AdminPageHeader
        title={`Welcome, @${admin.login}`}
        description="Edit your portfolio content."
      />
      <p className="mb-6 flex gap-2.5 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface-raised) p-4 text-sm text-(--color-text-secondary)">
        <Info
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-(--color-accent-primary)"
        />
        <span>
          Saving updates the database right away. The public site shows the
          changes after it is rebuilt; a one-click <strong>Publish</strong>{" "}
          button is coming in a later update.
        </span>
      </p>
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
