import { projects as defaultProjects } from "../../data/projects";

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
