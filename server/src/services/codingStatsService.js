import { getDb } from "../db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../db/collections.js";
import { fetchRepoFiles, fetchRepoInfo } from "./githubApi.js";

const HIDE_ID = { projection: { _id: 0 } };
const TIMEOUT_MS = 15_000;
const SOURCE_FILE = /\.(c|cc|cpp|cxx|py|java|js|kt|go|rs)$/i;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getJson(url, label) {
  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw httpError(502, `Couldn't reach ${label}.`);
  }
  if (!response.ok)
    throw httpError(502, `${label} answered ${response.status}.`);
  try {
    return await response.json();
  } catch {
    // VJudge answers an HTML page for a user that doesn't exist.
    throw httpError(502, `${label} didn't recognise the handle.`);
  }
}

const isoFromSeconds = (seconds) => new Date(seconds * 1000).toISOString();

/**
 * Rating, rank, and distinct accepted problems from the public Codeforces
 * API (no key needed).
 * @param {string} handle
 */
export async function fetchCodeforces(handle) {
  const base = "https://codeforces.com/api";
  const query = encodeURIComponent(handle);
  const [info, status, rating] = await Promise.all([
    getJson(`${base}/user.info?handles=${query}`, "Codeforces"),
    getJson(`${base}/user.status?handle=${query}`, "Codeforces"),
    getJson(`${base}/user.rating?handle=${query}`, "Codeforces"),
  ]);
  if (info.status !== "OK" || !info.result?.[0]) {
    throw httpError(502, `Codeforces has no user "${handle}".`);
  }
  const user = info.result[0];
  const submissions = status.result ?? [];
  // "1554A", the id VJudge uses too, so the two can be merged per judge.
  const solved = new Set(
    submissions
      .filter((submission) => submission.verdict === "OK")
      .map(({ problem }) => `${problem.contestId}${problem.index}`),
  );
  const times = submissions.map((submission) => submission.creationTimeSeconds);
  return {
    handle: user.handle,
    url: `https://codeforces.com/profile/${encodeURIComponent(user.handle)}`,
    rating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    maxRank: user.maxRank ?? null,
    solved: solved.size,
    problems: [...solved].sort(),
    contests: (rating.result ?? []).length,
    firstActiveAt: times.length ? isoFromSeconds(Math.min(...times)) : null,
    lastActiveAt: times.length ? isoFromSeconds(Math.max(...times)) : null,
  };
}

/**
 * Accepted problems per judge from VJudge's public solve record.
 * @param {string} handle
 */
export async function fetchVJudge(handle) {
  const data = await getJson(
    `https://vjudge.net/user/solveDetail/${encodeURIComponent(handle)}`,
    "VJudge",
  );
  const records = Object.entries(data.acRecords ?? {}).filter(
    ([, problems]) => problems.length > 0,
  );
  const byJudge = records
    .map(([judge, problems]) => ({ judge, solved: problems.length }))
    .sort((a, b) => b.solved - a.solved);
  return {
    handle,
    url: `https://vjudge.net/user/${encodeURIComponent(handle)}`,
    solved: byJudge.reduce((sum, entry) => sum + entry.solved, 0),
    byJudge,
    // VJudge only forwards to these judges; the ids let the merge below
    // count a problem solved both here and on Codeforces once.
    problemsByJudge: Object.fromEntries(records),
  };
}

// Codeforces gym contests have ids from 100000 up; VJudge files them
// under "Gym", apart from regular "CodeForces" problems.
const GYM_CONTEST_MIN = 100000;
const isGymProblem = (id) => Number.parseInt(id, 10) >= GYM_CONTEST_MIN;

/**
 * Solved problems per origin judge, merging the Codeforces account with
 * what VJudge forwarded to Codeforces (deduplicated by contest + index).
 * Without problem ids (a cache from before ids were stored) the larger of
 * the two counts is used and the overlap is unknown (null).
 * @param {Record<string, any> | null} codeforces
 * @param {Record<string, any> | null} vjudge
 * @returns {{ judges: Array<{ judge: string, solved: number, direct: number, vjudge: number, overlap: number | null }>, total: number }}
 */
export function mergeByJudge(codeforces, vjudge) {
  const direct = { CodeForces: [], Gym: [] };
  const directKnown = Array.isArray(codeforces?.problems);
  if (directKnown) {
    for (const id of codeforces.problems) {
      direct[isGymProblem(id) ? "Gym" : "CodeForces"].push(id);
    }
  }
  const viaKnown = Boolean(vjudge?.problemsByJudge);
  const counts = new Map(
    (vjudge?.byJudge ?? []).map((entry) => [entry.judge, entry.solved]),
  );
  const names = new Set([...counts.keys()]);
  if (codeforces) names.add("CodeForces");
  if (direct.Gym.length) names.add("Gym");

  const judges = [...names].map((judge) => {
    const own = direct[judge] ?? [];
    const via = vjudge?.problemsByJudge?.[judge] ?? [];
    const directCount =
      judge === "CodeForces" && !directKnown
        ? (codeforces?.solved ?? 0)
        : own.length;
    const vjudgeCount = counts.get(judge) ?? 0;
    if (directKnown && viaKnown) {
      const solved = new Set([...own, ...via]).size;
      return {
        judge,
        solved,
        direct: directCount,
        vjudge: vjudgeCount,
        overlap: directCount + vjudgeCount - solved,
      };
    }
    const unknownOverlap = directCount > 0 && vjudgeCount > 0;
    return {
      judge,
      solved: Math.max(directCount, vjudgeCount),
      direct: directCount,
      vjudge: vjudgeCount,
      overlap: unknownOverlap ? null : 0,
    };
  });
  judges.sort((a, b) => b.solved - a.solved || a.judge.localeCompare(b.judge));
  return {
    judges: judges.filter((entry) => entry.solved > 0),
    total: judges.reduce((sum, entry) => sum + entry.solved, 0),
  };
}

/** "Assiut-University-Training-CF" → "Assiut University Training CF" */
function folderLabel(folder) {
  return folder.replace(/[-_]+/g, " ").trim();
}

/**
 * Solution files per top-level folder of the practice repo. Folders are
 * judges or training sheets; files at the root count as "Other".
 * @param {string} name repo of the synced account
 */
export async function fetchPracticeRepo(name) {
  const [info, paths] = await Promise.all([
    fetchRepoInfo(name),
    fetchRepoFiles(name),
  ]);
  const files = paths.filter((path) => SOURCE_FILE.test(path));
  const counts = new Map();
  for (const path of files) {
    const folder = path.includes("/") ? path.split("/")[0] : "Other";
    counts.set(folder, (counts.get(folder) ?? 0) + 1);
  }
  return {
    name: info.name,
    url: info.url,
    createdAt: info.createdAt,
    pushedAt: info.pushedAt,
    files: files.length,
    folders: [...counts]
      .map(([folder, count]) => ({ folder: folderLabel(folder), files: count }))
      .sort((a, b) => b.files - a.files),
  };
}

const SOURCES = {
  codeforces: { handleOf: (ps) => ps.codeforcesHandle, fetch: fetchCodeforces },
  vjudge: { handleOf: (ps) => ps.vjudgeHandle, fetch: fetchVJudge },
  practice: { handleOf: (ps) => ps.practiceRepo, fetch: fetchPracticeRepo },
};

/**
 * Refreshes every configured source. One source failing keeps its last
 * good value (and records the error) without blocking the others.
 * @param {{ codeforcesHandle?: string, vjudgeHandle?: string, practiceRepo?: string }} problemSolving
 */
export async function syncCodingStats(problemSolving = {}) {
  const db = await getDb();
  const collection = db.collection(COLLECTIONS.codingStats);
  const previous =
    (await collection.findOne({ _id: SINGLETON_ID }, HIDE_ID)) ?? {};
  const attemptedAt = new Date().toISOString();
  const next = { lastAttemptAt: attemptedAt, errors: {} };

  await Promise.all(
    Object.entries(SOURCES).map(async ([key, source]) => {
      const handle = source.handleOf(problemSolving);
      if (!handle) {
        next[key] = null;
        return;
      }
      try {
        next[key] = { ...(await source.fetch(handle)), syncedAt: attemptedAt };
      } catch (error) {
        next[key] = previous[key] ?? null;
        next.errors[key] = error.message;
      }
    }),
  );
  await collection.replaceOne({ _id: SINGLETON_ID }, next, { upsert: true });
  return next;
}

/** The cached stats with sync errors and the per-judge merge, for the admin. */
export async function getCodingStatus() {
  const db = await getDb();
  const stats = await db
    .collection(COLLECTIONS.codingStats)
    .findOne({ _id: SINGLETON_ID }, HIDE_ID);
  if (!stats) return null;
  return {
    ...stats,
    ...mergeByJudge(stats.codeforces ?? null, stats.vjudge ?? null),
  };
}

/**
 * Stats for the public snapshot, or null before the first sync. Errors
 * and the raw problem ids stay in the admin.
 */
export async function getCodingSnapshot() {
  const stats = await getCodingStatus();
  if (!stats) return null;
  const { codeforces = null, vjudge = null, practice = null } = stats;
  if (!codeforces && !vjudge && !practice) return null;
  return {
    codeforces: codeforces && omit(codeforces, "problems"),
    vjudge: vjudge && omit(vjudge, "problemsByJudge"),
    practice,
    judges: stats.judges,
    total: stats.total,
  };
}

function omit(object, key) {
  const rest = { ...object };
  delete rest[key];
  return rest;
}
