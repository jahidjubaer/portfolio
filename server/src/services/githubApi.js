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
 */
async function githubGet(path) {
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
