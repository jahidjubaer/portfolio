import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Star,
} from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { syncGitHub } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import { formatRelativeDate } from "../../lib/relativeTime";
import { AdminPageHeader } from "./AdminPageHeader";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SyncSummary({ repositories }) {
  const { sync, tokenConfigured } = repositories;
  const lastFailed =
    sync?.error && (!sync.syncedAt || sync.lastAttemptAt > sync.syncedAt);
  return (
    <div className="mb-6 grid gap-2 text-sm text-(--color-text-secondary)">
      <p>
        {sync?.syncedAt
          ? `Last synced ${formatDateTime(sync.syncedAt)} · ${sync.repoCount} public repos. Syncs again every day.`
          : "Not synced yet. Press “Sync now” to load your repositories."}
      </p>
      {lastFailed ? (
        <p className="text-(--color-danger)">
          The last sync ({formatDateTime(sync.lastAttemptAt)}) failed:{" "}
          {sync.error}
        </p>
      ) : null}
      {tokenConfigured ? null : (
        <p>
          No <code>GITHUB_TOKEN</code> is set, so GitHub allows 60 requests an
          hour. That&apos;s enough for syncing; a read-only token raises the
          limit.
        </p>
      )}
    </div>
  );
}

function Warnings({ warnings }) {
  if (warnings.length === 0) return null;
  return (
    <section
      aria-labelledby="repo-warnings"
      className="mb-6 rounded-(--radius-lg) border border-(--color-danger)/40 p-4"
    >
      <h2
        id="repo-warnings"
        className="flex items-center gap-2 font-semibold text-(--color-text-primary)"
      >
        <AlertTriangle
          size={17}
          aria-hidden="true"
          className="text-(--color-danger)"
        />
        Needs attention
      </h2>
      <ul className="mt-2 grid gap-2 text-sm">
        {warnings.map((warning) => (
          <li key={`${warning.project}-${warning.url}`}>
            <Link
              to={`/admin/projects/${encodeURIComponent(warning.project)}`}
              className="font-semibold text-(--color-text-primary) underline underline-offset-4"
            >
              {warning.projectTitle}
            </Link>
            : {warning.message}{" "}
            <span className="break-all text-(--color-text-muted)">
              {warning.url}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RepoMeta({ repo }) {
  const parts = [
    repo.language,
    `updated ${formatRelativeDate(repo.pushedAt)}`,
  ].filter(Boolean);
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-(--color-text-muted)">
      {parts.join(" · ")}
      {repo.stars > 0 ? (
        <span className="inline-flex items-center gap-1">
          · <Star size={13} aria-hidden="true" />
          {repo.stars}
          <span className="sr-only">{repo.stars === 1 ? "star" : "stars"}</span>
        </span>
      ) : null}
      {repo.archived ? (
        <span className="rounded-full border border-(--color-border) px-2 text-xs">
          Archived
        </span>
      ) : null}
    </p>
  );
}

/**
 * The synced GitHub repos: which projects use them, which links broke,
 * and "Add as project" to start a project prefilled from a repo.
 */
export function AdminRepositoriesPage() {
  const { content, reload } = useAdmin();
  const navigate = useNavigate();
  const repositories = content.repositories;
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [showForks, setShowForks] = useState(false);
  const forkCount = repositories.repos.filter((repo) => repo.fork).length;
  const repos = repositories.repos.filter((repo) => showForks || !repo.fork);
  const titles = Object.fromEntries(
    content.projects.map((project) => [project.slug, project.title]),
  );

  async function handleSync() {
    setBusy(true);
    setStatus("Syncing with GitHub…");
    try {
      const { repoCount } = await syncGitHub();
      setStatus(`Synced ${repoCount} public repos.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      // Reload either way: a failed sync records its error for the summary.
      await reload();
      setBusy(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="GitHub repos"
        description={`Public repositories of @${repositories.username}. Language, last update, and repo links on the site come from here.`}
        actions={
          <Button
            onClick={handleSync}
            disabled={busy}
            leadingIcon={
              <RefreshCw
                size={16}
                className={busy ? "motion-safe:animate-spin" : undefined}
              />
            }
          >
            {busy ? "Syncing…" : "Sync now"}
          </Button>
        }
      />
      <p
        role="status"
        aria-live="polite"
        className="mb-3 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {status}
      </p>
      <SyncSummary repositories={repositories} />
      <Warnings warnings={repositories.warnings} />

      {forkCount > 0 ? (
        <label className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm text-(--color-text-secondary)">
          <input
            type="checkbox"
            checked={showForks}
            onChange={(event) => setShowForks(event.target.checked)}
            className="size-4"
          />
          Show forks ({forkCount})
        </label>
      ) : null}

      {repos.length === 0 ? (
        <p className="rounded-(--radius-lg) border border-dashed border-(--color-border-strong) p-6 text-center text-(--color-text-secondary)">
          No repositories yet.
        </p>
      ) : (
        <ul className="grid gap-2">
          {repos.map((repo) => (
            <li
              key={repo.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4"
            >
              <div className="min-w-0 flex-1 basis-64">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold break-all text-(--color-text-primary) hover:underline underline-offset-4"
                >
                  {repo.name}
                  <ExternalLink size={13} aria-hidden="true" />
                  <span className="sr-only">(opens GitHub)</span>
                </a>
                {repo.description ? (
                  <p className="mt-1 text-sm text-(--color-text-secondary)">
                    {repo.description}
                  </p>
                ) : null}
                <RepoMeta repo={repo} />
              </div>
              {repo.projects.length > 0 ? (
                <p className="text-sm text-(--color-text-secondary)">
                  Used by{" "}
                  {repo.projects.map((slug, index) => (
                    <span key={slug}>
                      {index > 0 ? ", " : null}
                      <Link
                        to={`/admin/projects/${encodeURIComponent(slug)}`}
                        className="font-semibold text-(--color-text-primary) underline underline-offset-4"
                      >
                        {titles[slug] ?? slug}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<Plus size={15} />}
                  aria-label={`Add ${repo.name} as a project`}
                  onClick={() =>
                    navigate("/admin/projects/new", {
                      state: { fromRepo: repo },
                    })
                  }
                >
                  Add as project
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
