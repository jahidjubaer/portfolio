import { env } from "../config/env.js";

const API_URL = "https://api.github.com";
const TIMEOUT_MS = 10_000;
const PER_PAGE = 100;
// 10 pages = 1,000 repositories, far more than this account will have.
const MAX_PAGES = 10;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function rateLimitError(response) {
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  const retryAfter = Number(response.headers.get("retry-after"));
  let when = "in a few minutes";
  if (retryAfter > 0) {
    when = `in ${Math.ceil(retryAfter / 60)} min`;
  } else if (reset > 0) {
    when = `after ${new Date(reset * 1000).toISOString().slice(11, 16)} UTC`;
  }
  return httpError(503, `GitHub's rate limit is used up. Try again ${when}.`);
}

/**
 * One GitHub API page. Rate limits answer 403 or 429 with the remaining
 * count at 0 (primary) or a Retry-After header (secondary).
 * @param {string} path
 * @param {{ missingOk?: boolean }} [options] answer null on 404 (a file
 *   the repo doesn't have) instead of failing
 */
async function githubGet(path, { missingOk = false } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "jahid-portfolio-sync",
        ...(env.githubToken
          ? { Authorization: `Bearer ${env.githubToken}` }
          : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw httpError(502, "Couldn't reach GitHub. Try again in a moment.");
  }
  const isRateLimited =
    (response.status === 403 || response.status === 429) &&
    (response.headers.get("x-ratelimit-remaining") === "0" ||
      response.headers.has("retry-after"));
  if (isRateLimited) throw rateLimitError(response);
  if (response.status === 401) {
    throw httpError(
      502,
      "GitHub rejected GITHUB_TOKEN (expired or revoked). Create a new token.",
    );
  }
  if (response.status === 404 && missingOk) return null;
  if (response.status === 404) {
    throw httpError(
      502,
      `GitHub has no account called "${env.githubUsername}".`,
    );
  }
  if (!response.ok) {
    throw httpError(502, `GitHub answered ${response.status}.`);
  }
  return response.json();
}

/**
 * @typedef {object} GitHubRepo
 * @property {number} id
 * @property {string} name
 * @property {string} url
 * @property {string | null} description
 * @property {string | null} language
 * @property {string[]} topics
 * @property {string | null} homepage
 * @property {number} stars
 * @property {boolean} fork
 * @property {boolean} archived
 * @property {string} pushedAt
 */

/** @returns {GitHubRepo} */
function toRepo(raw) {
  return {
    id: raw.id,
    name: raw.name,
    url: raw.html_url,
    description: raw.description || null,
    language: raw.language || null,
    topics: raw.topics ?? [],
    homepage: raw.homepage || null,
    stars: raw.stargazers_count ?? 0,
    fork: Boolean(raw.fork),
    archived: Boolean(raw.archived),
    pushedAt: raw.pushed_at,
  };
}

/**
 * Every public repository the account owns. The /users/:name endpoint
 * only ever returns public repositories, even with a token, so a private
 * repo can't leak into the site.
 * @returns {Promise<GitHubRepo[]>}
 */
export async function fetchPublicRepos() {
  const user = encodeURIComponent(env.githubUsername);
  const repos = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const batch = await githubGet(
      `/users/${user}/repos?type=owner&sort=pushed&per_page=${PER_PAGE}&page=${page}`,
    );
    repos.push(...batch.filter((raw) => !raw.private).map(toRepo));
    if (batch.length < PER_PAGE) break;
  }
  return repos;
}

// Enough of a README or manifest to understand a project; the rest is
// usually install steps and badges.
const MAX_FILE_CHARS = 12_000;
const MAX_TREE_PATHS = 400;

function repoPath(name) {
  return `/repos/${encodeURIComponent(env.githubUsername)}/${encodeURIComponent(name)}`;
}

/**
 * One public repo of the account, or a 404 error.
 * @param {string} name
 */
export async function fetchRepoInfo(name) {
  const repo = await githubGet(repoPath(name), { missingOk: true });
  if (!repo || repo.private) {
    throw httpError(404, `"${name}" isn't a public repository on GitHub.`);
  }
  return { ...toRepo(repo), createdAt: repo.created_at };
}

/**
 * Every file path in a public repo of the account (default branch).
 * @param {string} name
 * @returns {Promise<string[]>}
 */
export async function fetchRepoFiles(name) {
  const tree = await githubGet(`${repoPath(name)}/git/trees/HEAD?recursive=1`, {
    missingOk: true,
  });
  if (!tree) {
    throw httpError(404, `"${name}" isn't a public repository on GitHub.`);
  }
  return (tree.tree ?? [])
    .filter((entry) => entry.type === "blob")
    .map((entry) => entry.path);
}

async function fetchText(name, path) {
  const file = await githubGet(
    `${repoPath(name)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
    { missingOk: true },
  );
  if (!file?.content) return null;
  return Buffer.from(file.content, "base64")
    .toString("utf8")
    .slice(0, MAX_FILE_CHARS);
}

/**
 * What a repo is about, for drafting a project or learning track: its
 * description and topics, README, package manifests, languages, recent
 * commit messages, and a sample of the file tree. Public data only.
 * @param {string} name
 */
export async function fetchRepoContext(name) {
  const repo = await fetchRepoInfo(name);
  const files = await fetchRepoFiles(name);
  const manifests = files.filter(
    (path) =>
      /(^|\/)package\.json$/.test(path) && !path.includes("node_modules"),
  );
  const [readmeFile, languages, commits, ...manifestTexts] = await Promise.all([
    githubGet(`${repoPath(name)}/readme`, { missingOk: true }),
    githubGet(`${repoPath(name)}/languages`, { missingOk: true }),
    githubGet(`${repoPath(name)}/commits?per_page=30`, { missingOk: true }),
    ...manifests.slice(0, 3).map((path) => fetchText(name, path)),
  ]);
  return {
    ...repo,
    readme: readmeFile?.content
      ? Buffer.from(readmeFile.content, "base64")
          .toString("utf8")
          .slice(0, MAX_FILE_CHARS)
      : null,
    languages: languages ?? {},
    commitMessages: (commits ?? []).map(
      (commit) => commit.commit.message.split("\n")[0],
    ),
    manifests: manifests
      .slice(0, 3)
      .map((path, index) => ({ path, text: manifestTexts[index] }))
      .filter((manifest) => manifest.text),
    fileCount: files.length,
    files: files.slice(0, MAX_TREE_PATHS),
  };
}
