import { github } from "../generated/content.json";

/**
 * @typedef {{ name: string, url: string, language: string | null, stars: number, homepage: string | null, pushedAt: string }} RepoCard
 * @typedef {{
 *   username: string,
 *   profileUrl: string,
 *   repositoriesUrl: string,
 *   publicRepos: number,
 *   syncedAt: string | null,
 *   recentRepos: RepoCard[],
 *   repos: Record<string, RepoCard>,
 * }} GitHubSnapshot
 */

const USERNAME = "jahidjubaer";

/**
 * GitHub facts for the right rail ("Recently on GitHub"), the profile
 * stats, and project cards (language, last update), from the admin's
 * GitHub sync via the published content snapshot. Empty until the first
 * sync; the UI hides what it doesn't have.
 *
 * Follower and star counts are deliberately not shown on the site — they
 * are still low and would weaken rather than support the profile.
 * @type {GitHubSnapshot}
 */
export const githubSnapshot = github ?? {
  username: USERNAME,
  profileUrl: `https://github.com/${USERNAME}`,
  repositoriesUrl: `https://github.com/${USERNAME}?tab=repositories`,
  publicRepos: 0,
  syncedAt: null,
  recentRepos: [],
  repos: {},
};
