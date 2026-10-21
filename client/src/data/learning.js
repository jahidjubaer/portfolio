import {
  learning as storedLearning,
  learningTracks as storedTracks,
  studyLog as storedLog,
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
 *   goal?: string,
 *   syllabus?: Array<{ title: string, status: "todo" | "doing" | "done", date?: string }>,
 * }} LearningTrack
 */

/**
 * @typedef {{
 *   id: string,
 *   date: string,
 *   trackId: string,
 *   trackTitle: string,
 *   topic?: string,
 *   body: string,
 *   minutes?: number,
 *   links: Array<{ label: string, url: string }>,
 * }} StudyLogEntry
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

const trackTitles = new Map(
  learningTracks.map((track) => [track.id, track.title]),
);

/**
 * Public study sessions, newest first (the export already left out
 * private ones and those on private tracks).
 * @type {StudyLogEntry[]}
 */
export const studyLog = [...(storedLog ?? [])]
  .sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order)
  .filter((entry) => trackTitles.has(entry.trackId))
  .map(({ order: _order, visibility: _visibility, links, ...entry }) => ({
    ...entry,
    trackTitle: trackTitles.get(entry.trackId),
    links: links ?? [],
  }));

/**
 * What the profile's "Now studying" line says: the topic marked "doing"
 * on the first track being learned, else the newest session on such a
 * track. Null when nothing is being learned publicly.
 * @type {{ topic: string, track: string } | null}
 */
export const nowStudying = (() => {
  const learning = learningTracks.filter(
    (track) => track.status === "learning",
  );
  for (const track of learning) {
    const doing = (track.syllabus ?? []).find(
      (topic) => topic.status === "doing",
    );
    if (doing) return { topic: doing.title, track: track.title };
  }
  const ids = new Set(learning.map((track) => track.id));
  const latest = studyLog.find((entry) => ids.has(entry.trackId));
  return latest
    ? { topic: latest.topic ?? latest.trackTitle, track: latest.trackTitle }
    : null;
})();
