import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { formatYearMonth } from "../../lib/dates";
import { formatRelativeDate } from "../../lib/relativeTime";
import { useNow } from "../../lib/hydration";
import { cn } from "../../lib/cn";
import { ProgressRing } from "./ProgressRing";
import { SyllabusPath } from "./SyllabusPath";
import { trackProgress } from "./journal";

const STATUS_STYLES = {
  learning:
    "border-(--color-accent-primary)/35 bg-(--color-accent-primary-soft) text-(--color-accent-primary)",
  applied:
    "border-(--color-border) bg-(--color-surface-raised) text-(--color-text-primary)",
  exploring:
    "border-dashed border-(--color-border-strong) text-(--color-text-secondary)",
};

const STATUS_LABELS = {
  learning: "In progress",
  applied: "Applied",
  exploring: "Exploring",
};

const LINK =
  "text-(--color-text-primary) underline decoration-(--color-border-strong) underline-offset-4 hover:decoration-(--color-accent-primary)";

/** An external link with the "opens in a new tab" cue. */
function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={LINK}>
      {children}
      <ArrowUpRight
        size={13}
        aria-hidden="true"
        className="ml-0.5 inline-block align-[-0.1em] opacity-60"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** One row of the path: a label, then a dot-separated list. */
function PathRow({ label, children }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-3">
      <dt className="mono-meta pt-0.5 text-(--color-text-muted)">{label}</dt>
      <dd className="text-[0.9375rem] text-(--color-text-secondary)">
        {children}
      </dd>
    </div>
  );
}

/** Items joined with " · ", each already rendered. */
function DotList({ items }) {
  return items.map((item, index) => (
    <span key={item.key}>
      {index > 0 ? " · " : null}
      {item.node}
    </span>
  ));
}

/**
 * One learning track: what it was learned from, how it was practised,
 * what was built with it, and the notes written about it. Rows with
 * nothing in them are left out.
 * @param {{ track: import("../../data/learning").LearningTrack }} props
 */
export function LearningTrackCard({ track }) {
  const now = useNow();
  const learnedFrom = [
    ...track.resources.map((resource) => {
      const source = resource.organization
        ? ` (${resource.organization.name})`
        : "";
      return {
        key: `resource-${resource.label}`,
        node: resource.url ? (
          <>
            <ExternalLink href={resource.url}>{resource.label}</ExternalLink>
            {source}
          </>
        ) : (
          `${resource.label}${source}`
        ),
      };
    }),
    ...track.certifications.map((item) => ({
      key: `cert-${item.id}`,
      node: (
        <Link to="/credentials#certifications" className={LINK}>
          {item.title}
        </Link>
      ),
    })),
  ];

  const progress = trackProgress(track);
  const hasPath =
    learnedFrom.length > 0 ||
    Boolean(track.practice) ||
    track.projects.length > 0 ||
    track.notes.length > 0 ||
    track.repos.length > 0;

  return (
    <article className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-5">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          {progress ? (
            <ProgressRing
              done={progress.done}
              total={progress.total}
              size={40}
            />
          ) : null}
          <h3 className="text-[1.0625rem] font-semibold text-(--color-text-primary)">
            {track.title}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-sm font-medium",
            STATUS_STYLES[track.status],
          )}
        >
          {STATUS_LABELS[track.status]}
        </span>
      </div>
      {track.since ? (
        <p className="mono-meta mt-1 text-(--color-text-muted)">
          Since {formatYearMonth(track.since)}
        </p>
      ) : null}
      {track.summary ? (
        <p className="mt-3 text-[0.9375rem] text-(--color-text-secondary)">
          {track.summary}
        </p>
      ) : null}
      {track.goal ? (
        <p className="mt-2 text-[0.9375rem] text-(--color-text-secondary)">
          <span className="font-medium text-(--color-text-primary)">Goal:</span>{" "}
          {track.goal}
        </p>
      ) : null}

      {hasPath ? (
        <dl className="mt-4 grid gap-3 border-t border-(--color-border) pt-4">
          {learnedFrom.length ? (
            <PathRow label="Learn">
              <DotList items={learnedFrom} />
            </PathRow>
          ) : null}
          {track.practice ? (
            <PathRow label="Practice">{track.practice}</PathRow>
          ) : null}
          {track.projects.length ? (
            <PathRow label="Built">
              <DotList
                items={track.projects.map((project) => ({
                  key: project.slug,
                  node: (
                    <Link to={`/work/${project.slug}`} className={LINK}>
                      {project.title}
                    </Link>
                  ),
                }))}
              />
            </PathRow>
          ) : null}
          {track.repos.length ? (
            <PathRow label="Code">
              <DotList
                items={track.repos.map((repo) => ({
                  key: repo.name,
                  node: (
                    <>
                      <ExternalLink href={repo.url}>{repo.name}</ExternalLink>
                      {repo.language || repo.pushedAt ? (
                        <span className="text-(--color-text-muted)">
                          {" "}
                          (
                          {[
                            repo.language,
                            repo.pushedAt &&
                              `updated ${formatRelativeDate(repo.pushedAt, now)}`,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                          )
                        </span>
                      ) : null}
                    </>
                  ),
                }))}
              />
            </PathRow>
          ) : null}
          {track.notes.length ? (
            <PathRow label="Notes">
              <DotList
                items={track.notes.map((note) => ({
                  key: note.url,
                  node: (
                    <ExternalLink href={note.url}>{note.label}</ExternalLink>
                  ),
                }))}
              />
            </PathRow>
          ) : null}
        </dl>
      ) : null}
      {progress ? <SyllabusPath syllabus={track.syllabus} /> : null}
    </article>
  );
}
