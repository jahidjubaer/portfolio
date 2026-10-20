import { coding } from "../generated/content.json";
import { profile } from "./profile";

/**
 * @typedef {{ handle: string, url: string, rating: number | null, maxRating: number | null, rank: string | null, solved: number, contests: number, firstActiveAt: string | null, lastActiveAt: string | null }} CodeforcesStats
 * @typedef {{ handle: string, url: string, solved: number, byJudge: Array<{ judge: string, solved: number }> }} VJudgeStats
 * @typedef {{ name: string, url: string, createdAt: string, pushedAt: string, files: number, folders: Array<{ folder: string, files: number }> }} PracticeRepoStats
 * @typedef {{ judge: string, solved: number, direct: number, vjudge: number, overlap: number | null }} JudgeStats
 *   One origin judge after the merge: `direct` on the judge's own site
 *   (only Codeforces has an account), `vjudge` forwarded through VJudge,
 *   `overlap` solved on both (null when the sync couldn't tell).
 */

/**
 * Live problem-solving numbers from the daily sync (Codeforces, VJudge,
 * and the practice repo on GitHub), via the published content snapshot.
 * Each part is null until it has been synced; the UI shows what it has.
 * @type {{ codeforces: CodeforcesStats | null, vjudge: VJudgeStats | null, practice: PracticeRepoStats | null, judges: JudgeStats[], total: number }}
 */
export const codingStats = {
  codeforces: coding?.codeforces ?? null,
  vjudge: coding?.vjudge ?? null,
  practice: coding?.practice ?? null,
  judges: coding?.judges ?? [],
  total: coding?.total ?? 0,
};

export const hasCodingStats = Boolean(
  codingStats.codeforces || codingStats.vjudge || codingStats.practice,
);

/** "paused" shows the numbers as an archive of past practice. */
export const isPracticePaused = profile.problemSolving.status === "paused";

/**
 * Dimik OJ (a Bangla judge) has no public API: Jahid types the count in
 * the admin. Null until it is entered.
 * @type {number | null}
 */
export const dimikSolved = Number.isInteger(profile.problemSolving.dimikSolved)
  ? profile.problemSolving.dimikSolved
  : null;

/**
 * The headline: distinct problems across every judge (overlaps counted
 * once) plus Dimik OJ. Null before the first sync, when the profile's own
 * summary is shown instead.
 */
export function distinctSolved(stats = codingStats, dimik = dimikSolved) {
  if (!stats.judges.length) return null;
  return stats.total + (dimik ?? 0);
}

/**
 * The months the practice spans, from the synced activity (first
 * Codeforces submission or repo creation → last submission or push).
 * @returns {{ start: string, end: string } | null} ISO dates
 */
export function practicePeriod(stats = codingStats) {
  const starts = [stats.codeforces?.firstActiveAt, stats.practice?.createdAt];
  const ends = [stats.codeforces?.lastActiveAt, stats.practice?.pushedAt];
  const start = starts.filter(Boolean).sort()[0];
  const end = ends.filter(Boolean).sort().at(-1);
  return start && end ? { start, end } : null;
}
