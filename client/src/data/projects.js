import { projects as storedProjects } from "../generated/content.json";
import { assertValidProjects } from "./project-schema";

/**
 * Projects, in display order. Edited in the admin panel and read from the
 * published content snapshot (see generated/content.json). Every field
 * must still trace back to a confirmed fact; unverified ones are omitted
 * and listed in the project's `missingContent`.
 *
 * @typedef {{ label: string, url: string | null, type: "live" | "repository" | "documentation" }} ProjectLink
 * @typedef {{
 *   id: string,
 *   heading: string,
 *   type: "text" | "gallery",
 *   body?: string,
 * }} CaseStudySection  `body` is Markdown; a gallery section has none.
 * @typedef {{
 *   role?: string,
 *   timeline?: string,
 *   sections: CaseStudySection[],
 *   gallery?: { file: string, caption: string }[],
 * }} CaseStudy
 * @typedef {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   projectType: string,
 *   status: "live" | "repository-available" | "private" | "archived",
 *   featured: boolean,
 *   stack: string[],
 *   capabilities: string[],
 *   links: ProjectLink[],
 *   caseStudyStatus: "complete" | "in-preparation" | "none",
 *   caseStudy: CaseStudy | null,
 *   roleContext?: string,
 *   relatedSlugs: string[],
 *   seo: { title: string, description: string },
 *   missingContent: string[],
 * }} Project
 */

/** @type {Project[]} */
export const projects = assertValidProjects(storedProjects);
