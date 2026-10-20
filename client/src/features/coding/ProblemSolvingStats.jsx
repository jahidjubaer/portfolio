import { ArrowUpRight } from "lucide-react";
import { profile } from "../../data/profile";
import {
  codingStats,
  dimikSolved,
  distinctSolved,
  hasCodingStats,
  isPracticePaused,
  practicePeriod,
} from "../../data/coding";
import { judgeLabel, judgeSource } from "./judges";
import { formatYearMonth } from "../../lib/dates";
import { cn } from "../../lib/cn";

const LINK =
  "inline-flex min-h-11 items-center gap-1 text-sm font-medium text-(--color-text-primary) underline decoration-(--color-border-strong) underline-offset-4 hover:decoration-(--color-accent-primary)";

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={LINK}>
      {children}
      <ArrowUpRight size={14} aria-hidden="true" className="opacity-60" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Stat({ value, label, detail, accent = false }) {
  return (
    <div
      className={cn(
        "rounded-(--radius-md) border p-3.5",
        accent
          ? "border-(--color-accent-primary)/40 bg-(--color-accent-primary-soft)"
          : "border-(--color-border) bg-(--color-surface-soft)",
      )}
    >
      <dt className="sr-only">{label}</dt>
      <dd>
        <span
          className={cn(
            "block font-mono text-2xl font-semibold tabular-nums",
            accent
              ? "text-(--color-accent-primary)"
              : "text-(--color-text-primary)",
          )}
        >
          {value}
        </span>
        <span
          aria-hidden="true"
          className="mt-0.5 block text-sm text-(--color-text-secondary)"
        >
          {label}
        </span>
        {detail ? (
          <span className="mono-meta mt-1 block text-(--color-text-muted)">
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

const monthOf = (iso) => formatYearMonth(iso.slice(0, 7));

const SOURCE_TEXT = {
  direct: "Codeforces account",
  vjudge: "via VJudge",
  both: "account and VJudge",
};

/** "via VJudge", or "account and VJudge · 14 on both" */
function sourceText(entry) {
  const source = judgeSource(entry);
  if (source !== "both" || !entry.overlap) return SOURCE_TEXT[source];
  return `${SOURCE_TEXT.both} · ${entry.overlap} on both`;
}

/**
 * Solves per origin judge. VJudge only forwards submissions, so each row
 * is the judge the problem really comes from.
 */
function JudgeTable({ judges }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Problems solved per judge</caption>
        <thead>
          <tr className="border-b border-(--color-border) text-(--color-text-muted)">
            <th scope="col" className="py-1.5 pr-3 font-medium">
              Judge
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Solved
            </th>
            <th scope="col" className="py-1.5 font-medium">
              Solved on
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--color-border)">
          {judges.map((entry) => {
            const label = judgeLabel(entry.judge);
            return (
              <tr key={entry.judge}>
                <th
                  scope="row"
                  className="py-1.5 pr-3 font-medium text-(--color-text-primary)"
                >
                  {label.name}
                  {label.note ? (
                    <span className="block text-xs font-normal text-(--color-text-muted)">
                      {label.note}
                    </span>
                  ) : null}
                </th>
                <td className="py-1.5 pr-3 text-right font-mono text-(--color-text-primary) tabular-nums">
                  {entry.solved}
                </td>
                <td className="py-1.5 text-(--color-text-secondary)">
                  {sourceText(entry)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Dimik OJ: typed in the admin (no public API), so shown on its own. */
function DimikCard({ solved }) {
  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-(--radius-md) border border-(--color-accent-primary)/40 bg-(--color-accent-primary-soft) px-3.5 py-3">
      <p className="font-semibold text-(--color-text-primary)">Dimik OJ</p>
      <p className="text-sm text-(--color-text-secondary)">
        <span className="font-mono font-semibold text-(--color-accent-primary) tabular-nums">
          {solved}
        </span>{" "}
        solved · a Bangla online judge
      </p>
    </div>
  );
}

/**
 * Problem-solving numbers from the daily sync: distinct problems per
 * origin judge (overlaps between VJudge and the Codeforces account
 * counted once), Dimik OJ, the Codeforces rating, and the solutions repo. When the practice is
 * paused (set in the admin) the block says so and shows the period, so
 * old numbers never read as current activity. Without synced stats it
 * falls back to the profile's own summary.
 * @param {{ columns?: 1 | 3, className?: string }} props
 */
export function ProblemSolvingStats({ columns = 3, className }) {
  const { codeforces, practice, judges } = codingStats;
  const period = practicePeriod();
  const total = distinctSolved();
  const judgeCount = judges.length + (dimikSolved === null ? 0 : 1);

  if (!hasCodingStats) {
    return (
      <div className={className}>
        <p className="text-[0.9375rem] text-(--color-text-secondary)">
          {profile.problemSolving.total} in{" "}
          {profile.problemSolving.primaryLanguage}, on{" "}
          {profile.problemSolving.platforms}.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {isPracticePaused && period ? (
        <p className="mb-3 inline-flex flex-wrap items-center gap-x-2 rounded-full border border-dashed border-(--color-border-strong) px-3 py-1 text-sm text-(--color-text-secondary)">
          <span className="font-medium text-(--color-text-primary)">
            Practice archive
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {monthOf(period.start)} – {monthOf(period.end)}
          </span>
        </p>
      ) : null}

      <dl
        className={cn(
          "grid gap-2.5",
          columns === 3 ? "sm:grid-cols-3" : "grid-cols-1",
        )}
      >
        {total !== null ? (
          <Stat
            accent
            value={total}
            label="distinct problems solved"
            detail={`on ${judgeCount} judges, each counted once`}
          />
        ) : null}
        {codeforces ? (
          <Stat
            value={codeforces.maxRating ?? codeforces.solved}
            label={
              codeforces.maxRating
                ? "max Codeforces rating"
                : "Codeforces problems solved"
            }
            detail={[
              codeforces.maxRank,
              codeforces.contests && `${codeforces.contests} contests`,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        ) : null}
        {practice ? (
          <Stat
            value={practice.files}
            label="solutions on GitHub"
            detail={`${profile.problemSolving.primaryLanguage}, ${practice.folders.length} sources`}
          />
        ) : null}
      </dl>

      {dimikSolved !== null ? <DimikCard solved={dimikSolved} /> : null}
      {judges.length ? <JudgeTable judges={judges} /> : null}

      {isPracticePaused ? (
        <p className="mt-3 text-sm text-(--color-text-muted)">
          I&apos;m not practising competitively right now. These numbers are a
          record of that practice, refreshed from each site.
        </p>
      ) : null}

      <p className="mt-1 flex flex-wrap gap-x-5">
        {codingStats.vjudge ? (
          <ExternalLink href={codingStats.vjudge.url}>VJudge</ExternalLink>
        ) : null}
        {codeforces ? (
          <ExternalLink href={codeforces.url}>Codeforces</ExternalLink>
        ) : null}
        {practice ? (
          <ExternalLink href={practice.url}>Solutions repo</ExternalLink>
        ) : null}
      </p>
    </div>
  );
}
