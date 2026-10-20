import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Code2,
  ExternalLink,
  FolderPlus,
  Plus,
  RefreshCw,
  Sprout,
  Star,
} from "lucide-react";
import { useAdmin } from "../../features/admin/admin-context";
import { syncCodingStats, syncGitHub } from "../../features/admin/admin-api";
import { Button } from "../../components/ui/Button";
import { formatRelativeDate } from "../../lib/relativeTime";
import { judgeLabel } from "../../features/coding/judges";
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

const SOURCE_LABELS = {
  codeforces: "Codeforces",
  vjudge: "VJudge",
  practice: "Solutions repo",
};

/** One line per coding source: its numbers, or why it isn't synced. */
function codingSummary(key, stats) {
  if (key === "codeforces") {
    return `@${stats.handle} · max rating ${stats.maxRating ?? "—"} · ${stats.solved} solved · ${stats.contests} contests`;
  }
  if (key === "vjudge") {
    return `@${stats.handle} · ${stats.solved} solved on ${stats.byJudge.length} judges`;
  }
  return `${stats.name} · ${stats.files} solution files in ${stats.folders.length} folders`;
}

/**
 * The per-judge merge: what each source counted and how many problems
 * were solved on both (counted once in the total).
 */
function JudgeMerge({ judges, total }) {
  const overlap = judges.reduce((sum, entry) => sum + (entry.overlap ?? 0), 0);
  const unknown = judges.some((entry) => entry.overlap === null);
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[26rem] text-left text-sm">
        <caption className="mb-1.5 text-left text-(--color-text-secondary)">
          <span className="font-medium text-(--color-text-primary)">
            {total} distinct problems
          </span>{" "}
          by origin judge
          {overlap ? ` · ${overlap} solved on both VJudge and Codeforces` : ""}
          {unknown ? " · sync again to work out the overlap" : ""}
        </caption>
        <thead>
          <tr className="border-b border-(--color-border) text-(--color-text-muted)">
            <th scope="col" className="py-1 pr-3 font-medium">
              Judge
            </th>
            <th scope="col" className="py-1 pr-3 text-right font-medium">
              Account
            </th>
            <th scope="col" className="py-1 pr-3 text-right font-medium">
              VJudge
            </th>
            <th scope="col" className="py-1 pr-3 text-right font-medium">
              On both
            </th>
            <th scope="col" className="py-1 text-right font-medium">
              Counted
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border) tabular-nums">
          {judges.map((entry) => (
            <tr key={entry.judge}>
              <th
                scope="row"
                className="py-1 pr-3 font-medium text-(--color-text-primary)"
              >
                {judgeLabel(entry.judge).name}
              </th>
              <td className="py-1 pr-3 text-right">{entry.direct || "—"}</td>
              <td className="py-1 pr-3 text-right">{entry.vjudge || "—"}</td>
              <td className="py-1 pr-3 text-right">
                {entry.overlap === null ? "?" : entry.overlap || "—"}
              </td>
              <td className="py-1 text-right font-medium text-(--color-text-primary)">
                {entry.solved}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Codeforces, VJudge, and the solutions repo: synced daily with the repos
 * (handles are set on the Profile page).
 */
function CodingStatsPanel({ status, onSynced }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const errors = status?.errors ?? {};

  async function handleSync() {
    setBusy(true);
    setMessage("Syncing coding stats…");
    try {
      const result = await syncCodingStats();
      const failed = Object.keys(result.errors ?? {}).length;
      setMessage(
        failed
          ? `Synced, but ${failed} source(s) failed.`
          : "Coding stats synced.",
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      await onSynced();
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="coding-stats"
      className="mb-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="coding-stats"
          className="flex items-center gap-2 font-semibold text-(--color-text-primary)"
        >
          <Code2
            size={17}
            aria-hidden="true"
            className="text-(--color-accent-primary)"
          />
          Coding stats
        </h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleSync}
          disabled={busy}
          leadingIcon={
            <RefreshCw
              size={15}
              className={busy ? "motion-safe:animate-spin" : undefined}
            />
          }
        >
          {busy ? "Syncing…" : "Sync coding stats"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-(--color-text-secondary)">
        Shown on Resume and Learning. Handles and the solutions repo are set on{" "}
        <Link to="/admin/profile" className="underline underline-offset-4">
          Profile
        </Link>
        .{" "}
        {status?.lastAttemptAt
          ? `Last synced ${formatDateTime(status.lastAttemptAt)}.`
          : "Not synced yet."}
      </p>
      <ul className="mt-3 grid gap-1.5 text-sm">
        {Object.entries(SOURCE_LABELS).map(([key, label]) => (
          <li key={key} className="text-(--color-text-secondary)">
            <span className="font-medium text-(--color-text-primary)">
              {label}:
            </span>{" "}
            {status?.[key] ? codingSummary(key, status[key]) : "not set up"}
            {errors[key] ? (
              <span className="block text-(--color-danger)">
                Last sync failed: {errors[key]}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {status?.judges?.length ? (
        <JudgeMerge judges={status.judges} total={status.total} />
      ) : null}
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 text-sm text-(--color-text-secondary)"
      >
        {message}
      </p>
    </section>
  );
}

const SELECT =
  "min-h-11 max-w-56 rounded-(--radius-md) border border-(--color-border-strong) bg-(--color-canvas) px-2 text-sm text-(--color-text-primary)";

/**
 * "Add to existing project": opens that project's editor with the repo
 * already added under GitHub repositories (unsaved, to check first).
 */
function AddToProject({ repo, projects }) {
  const id = useId();
  const navigate = useNavigate();
  const [slug, setSlug] = useState(projects[0]?.slug ?? "");
  if (projects.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="sr-only">
        Project to add {repo.name} to
      </label>
      <select
        id={id}
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        className={SELECT}
      >
        {projects.map((project) => (
          <option key={project.slug} value={project.slug}>
            {project.title}
          </option>
        ))}
      </select>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<FolderPlus size={15} />}
        aria-label={`Add ${repo.name} to the chosen project`}
        onClick={() =>
          navigate(`/admin/projects/${encodeURIComponent(slug)}`, {
            state: { addRepo: { name: repo.name, url: repo.url } },
          })
        }
      >
        Add to project
      </Button>
    </div>
  );
}

/**
 * The synced GitHub repos: which projects use them, which links broke,
 * and "Add as project" / "Add as learning track" to start one from a repo.
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
  const trackRepos = new Set(
    (content.learningTracks ?? []).flatMap((track) =>
      (track.repos ?? []).map((name) => name.toLowerCase()),
    ),
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
      <CodingStatsPanel status={content.codingStatus} onSynced={reload} />

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
              <div className="flex flex-wrap items-center gap-2">
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
                <AddToProject
                  repo={repo}
                  projects={content.projects.filter(
                    (project) => !repo.projects.includes(project.slug),
                  )}
                />
                {trackRepos.has(repo.name.toLowerCase()) ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    leadingIcon={<Sprout size={15} />}
                    aria-label={`Add ${repo.name} as a learning track`}
                    onClick={() =>
                      navigate("/admin/learningTracks/new", {
                        state: { fromRepo: repo },
                      })
                    }
                  >
                    Add as learning track
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
