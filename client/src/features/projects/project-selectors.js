import { projects as defaultProjects } from "../../data/projects";
import { githubSnapshot } from "../../data/github";

/**
 * Pure helpers over the project data set. Every selector accepts an
 * optional `projectList` so tests can pass fixture data instead of the
 * real, imported data set.
 */

export function getAllProjects(projectList = defaultProjects) {
  return projectList;
}

export function getFeaturedProjects(projectList = defaultProjects) {
  return projectList.filter((project) => project.featured);
}

export function getProjectBySlug(slug, projectList = defaultProjects) {
  return projectList.find((project) => project.slug === slug) ?? null;
}

export function getRelatedProjects(slug, projectList = defaultProjects) {
  const project = getProjectBySlug(slug, projectList);
  if (!project) return [];
  return project.relatedSlugs
    .map((relatedSlug) => getProjectBySlug(relatedSlug, projectList))
    .filter(Boolean);
}

export function hasCompleteCaseStudy(project) {
  return Boolean(project) && project.caseStudyStatus === "complete";
}

export function getProjectLinks(project, type) {
  if (!project) return [];
  const links = project.links ?? [];
  return type ? links.filter((link) => link.type === type) : links;
}

/**
 * Short mark for the media tile when a project has no cover image: an
 * all-caps first word ("ICT") is kept, otherwise up to two initials.
 * @param {string} title
 */
export function getProjectMonogram(title) {
  const words = title.trim().split(/\s+/);
  if (/^[A-Z]{2,4}$/.test(words[0])) return words[0];
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * Lower-cased repo name of a `https://github.com/<user>/<repo>` link, or
 * null for anything else (mirrors the server's sync matching).
 * @param {string | null} url
 * @param {string} username
 */
export function getRepoName(url, username) {
  if (!url || !URL.canParse(url)) return null;
  const { hostname, pathname } = new URL(url);
  if (hostname !== "github.com" && hostname !== "www.github.com") return null;
  const [owner, name] = pathname.split("/").filter(Boolean);
  if (!name || owner.toLowerCase() !== username.toLowerCase()) return null;
  return name.replace(/\.git$/, "").toLowerCase();
}

/**
 * The synced GitHub facts for a project: its most recently pushed linked
 * repository, or null when none of its repos are in the snapshot.
 * @returns {import("../../data/github").RepoCard | null}
 */
export function getProjectRepo(project, snapshot = githubSnapshot) {
  const repos = getProjectLinks(project, "repository")
    .map((link) => snapshot.repos[getRepoName(link.url, snapshot.username)])
    .filter(Boolean);
  if (repos.length === 0) return null;
  return repos.reduce((latest, repo) =>
    repo.pushedAt > latest.pushedAt ? repo : latest,
  );
}

/**
 * Where "visit the live site" goes: the project's own live link first,
 * then the homepage set on its GitHub repository.
 * @returns {string | null}
 */
export function getProjectLiveUrl(project, snapshot = githubSnapshot) {
  const [live] = getProjectLinks(project, "live");
  if (live?.url) return live.url;
  return getProjectRepo(project, snapshot)?.homepage ?? null;
}
