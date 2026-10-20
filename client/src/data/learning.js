import {
  learning as storedLearning,
  learningTracks as storedTracks,
} from "../generated/content.json";
import { getOrganization } from "./organizations";
import { getCertification } from "./certifications";
import { projects } from "./projects";
import { githubSnapshot } from "./github";

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   status: "learning" | "applied" | "exploring",
 *   since?: string,
 *   summary?: string,
 *   resources: Array<{ label: string, url?: string, organization?: import("./organizations").Organization }>,
 *   certifications: import("./certifications").Certification[],
 *   practice?: string,
 *   projects: Array<{ slug: string, title: string }>,
 *   notes: Array<{ label: string, url: string }>,
 *   repos: Array<{ name: string, url: string, language?: string | null, pushedAt?: string }>,
 * }} LearningTrack
 */

/** The "How I learn" steps at the top of /learning. */
export const learningMethod = storedLearning;

export const LEARNING_STATUSES = [
  { id: "learning", label: "Now learning" },
  { id: "applied", label: "Applied" },
  { id: "exploring", label: "Exploring" },
];

/**
 * One stored track with its references resolved. Shared with the admin's
 * live preview, which passes lookups over its own content.
 * @param {Record<string, any>} stored
 * @param {{
 *   findOrganization: (id: string) => import("./organizations").Organization,
 *   findCertification: (id: string) => import("./certifications").Certification | undefined,
 *   projectList: Array<{ slug: string, title: string }>,
 *   findRepo?: (name: string) => { name: string, url: string, language?: string | null, pushedAt?: string } | undefined,
 * }} lookups
 * @returns {LearningTrack}
 */
export function resolveTrack(
  stored,
  {
    findOrganization,
    findCertification,
    projectList,
    findRepo = findSyncedRepo,
  },
) {
  const { certificationIds, projectSlugs, resources, ...track } = stored;
  delete track.order;
  return {
    ...track,
    resources: (resources ?? []).map(({ organizationId, ...resource }) =>
      organizationId
        ? { ...resource, organization: findOrganization(organizationId) }
        : resource,
    ),
    certifications: (certificationIds ?? [])
      .map(findCertification)
      .filter(Boolean),
    projects: (projectSlugs ?? [])
      .map((slug) => projectList.find((project) => project.slug === slug))
      .filter(Boolean)
      .map((project) => ({ slug: project.slug, title: project.title })),
    notes: track.notes ?? [],
    repos: (track.repos ?? []).map(
      (name) =>
        findRepo(name) ?? {
          name,
          url: `https://github.com/${githubSnapshot.username}/${name}`,
        },
    ),
  };
}

/** A connected repo's synced card (language, last push), when synced. */
function findSyncedRepo(name) {
  return githubSnapshot.repos[name.toLowerCase()];
}

/**
 * Learning tracks with their references resolved: projects and
 * certifications are linked by id in the admin, never retyped.
 * @type {LearningTrack[]}
 */
export const learningTracks = [...storedTracks]
  .sort((a, b) => a.order - b.order)
  .map((stored) =>
    resolveTrack(stored, {
      findOrganization: getOrganization,
      findCertification: getCertification,
      projectList: projects,
    }),
  );
