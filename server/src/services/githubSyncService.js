import { env } from "../config/env.js";
import { getDb } from "../db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../db/collections.js";
import { fetchPublicRepos } from "./githubApi.js";

const HIDE_ID = { projection: { _id: 0 } };
const RECENT_COUNT = 3;

/**
 * Repo name from a project link, when it points at a repository of the
 * synced account (`https://github.com/<user>/<repo>`). Links to other
 * accounts can't be checked, so they are ignored.
 * @param {string | null} url
 * @returns {string | null} lower-cased repo name
 */
export function repoNameFromUrl(url) {
  if (!url || !URL.canParse(url)) return null;
  const { hostname, pathname } = new URL(url);
  if (hostname !== "github.com" && hostname !== "www.github.com") return null;
  const [owner, name] = pathname.split("/").filter(Boolean);
  if (!name || owner.toLowerCase() !== env.githubUsername.toLowerCase()) {
    return null;
  }
  return name.replace(/\.git$/, "").toLowerCase();
}

/** Each project's repository links, as lower-cased repo names. */
function linkedRepos(projects) {
  return projects.flatMap((project) =>
    project.links
      .filter((link) => link.type === "repository")
      .map((link) => ({ project, link, name: repoNameFromUrl(link.url) }))
      .filter((entry) => entry.name),
  );
}

/**
 * Pulls every public repo into the cache. Repos that are gone from the
 * answer (deleted, renamed, or made private) are removed, so the cache
 * always mirrors GitHub. On failure the old cache stays and the error is
 * recorded for the admin.
 * @returns {Promise<{ repoCount: number }>}
 */
export async function syncGitHubRepos() {
  const db = await getDb();
  const state = db.collection(COLLECTIONS.githubSync);
  const attemptedAt = new Date().toISOString();
  let repos;
  try {
    repos = await fetchPublicRepos();
  } catch (error) {
    await state.updateOne(
      { _id: SINGLETON_ID },
      { $set: { lastAttemptAt: attemptedAt, error: error.message } },
      { upsert: true },
    );
    throw error;
  }

  const cache = db.collection(COLLECTIONS.githubRepos);
  if (repos.length) {
    await cache.bulkWrite(
      repos.map((repo) => ({
        replaceOne: {
          filter: { id: repo.id },
          replacement: { ...repo, syncedAt: attemptedAt },
          upsert: true,
        },
      })),
    );
  }
  await cache.deleteMany({ id: { $nin: repos.map((repo) => repo.id) } });
  await state.replaceOne(
    { _id: SINGLETON_ID },
    {
      syncedAt: attemptedAt,
      lastAttemptAt: attemptedAt,
      repoCount: repos.length,
      error: null,
    },
    { upsert: true },
  );
  return { repoCount: repos.length };
}

async function readCache() {
  const db = await getDb();
  const [state, repos] = await Promise.all([
    db
      .collection(COLLECTIONS.githubSync)
      .findOne({ _id: SINGLETON_ID }, HIDE_ID),
    db
      .collection(COLLECTIONS.githubRepos)
      .find({}, HIDE_ID)
      .sort({ pushedAt: -1 })
      .toArray(),
  ]);
  return { state, repos };
}

/**
 * What the admin's Repositories page shows: the cached repos with the
 * projects that link to them, and warnings for project links whose repo
 * no longer exists publicly. Warnings wait for a first successful sync,
 * so an empty cache doesn't flag every project.
 * @param {Array<{ slug: string, title: string, links: Array<{ label: string, url: string | null, type: string }> }>} projects
 */
export async function getGitHubOverview(projects) {
  const { state, repos } = await readCache();
  const links = linkedRepos(projects);
  const known = new Set(repos.map((repo) => repo.name.toLowerCase()));
  const warnings = state?.syncedAt
    ? links
        .filter((entry) => !known.has(entry.name))
        .map(({ project, link }) => ({
          project: project.slug,
          projectTitle: project.title,
          url: link.url,
          message: `${link.label} isn't a public repository on GitHub anymore (deleted, renamed, or made private).`,
        }))
    : [];
  return {
    username: env.githubUsername,
    tokenConfigured: Boolean(env.githubToken),
    sync: state,
    repos: repos.map((repo) => ({
      ...repo,
      projects: links
        .filter((entry) => entry.name === repo.name.toLowerCase())
        .map((entry) => entry.project.slug),
    })),
    warnings,
  };
}

/**
 * GitHub facts for the public site snapshot: the "Recently on GitHub"
 * list, the public repo count, and live stats for the repos projects link
 * to. Null until the first sync.
 * @param {Array<{ links: Array<{ url: string | null, type: string }> }>} projects
 */
export async function getGitHubSnapshot(projects) {
  const { state, repos } = await readCache();
  if (!state?.syncedAt) return null;
  const wanted = new Set(linkedRepos(projects).map((entry) => entry.name));
  const card = ({ name, url, language, stars, homepage, pushedAt }) => ({
    name,
    url,
    language,
    stars,
    homepage,
    pushedAt,
  });
  return {
    username: env.githubUsername,
    profileUrl: `https://github.com/${env.githubUsername}`,
    repositoriesUrl: `https://github.com/${env.githubUsername}?tab=repositories`,
    publicRepos: repos.length,
    syncedAt: state.syncedAt,
    recentRepos: repos
      .filter((repo) => !repo.fork && !repo.archived)
      .slice(0, RECENT_COUNT)
      .map(card),
    repos: Object.fromEntries(
      repos
        .filter((repo) => wanted.has(repo.name.toLowerCase()))
        .map((repo) => [repo.name.toLowerCase(), card(repo)]),
    ),
  };
}
