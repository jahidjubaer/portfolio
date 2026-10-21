import { getDb } from "../db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../db/collections.js";
import { getGitHubSnapshot } from "./githubSyncService.js";
import { getCodingSnapshot } from "./codingStatsService.js";
import { getBooksSnapshot } from "./goodreadsService.js";
import { withDefaultSettings } from "../schemas/settings-defaults.js";

const HIDE_ID = { projection: { _id: 0 } };

async function findSingleton(name) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS[name])
    .findOne({ _id: SINGLETON_ID }, HIDE_ID);
}

async function findOrdered(name, filter = {}) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS[name])
    .find(filter, HIDE_ID)
    .sort({ order: 1 })
    .toArray();
}

export const getProfile = () => findSingleton("profile");
export const getBeyond = () => findSingleton("beyond");
export const getLearning = () => findSingleton("learning");
// Never empty: a database without settings gets the defaults.
export const getSettings = async () =>
  withDefaultSettings(await findSingleton("settings"));
// "Hidden until ready" projects stay in the admin only.
const VISIBLE = { hidden: { $ne: true } };

/**
 * Projects in display order; hidden ones only for the admin.
 * @param {{ includeHidden?: boolean }} [options]
 */
export const listProjects = ({ includeHidden = false } = {}) =>
  findOrdered("projects", includeHidden ? {} : VISIBLE);
export const listOrganizations = () => findOrdered("organizations");
export const listExperience = () => findOrdered("experience");
export const listEducation = () => findOrdered("education");
export const listSkills = () => findOrdered("skills");
export const listCertifications = () => findOrdered("certifications");
export const listLearningTracks = () => findOrdered("learningTracks");

/** Study sessions, newest first. */
export async function listStudyLog() {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.studyLog)
    .find({}, HIDE_ID)
    .sort({ date: -1, order: -1 })
    .toArray();
}

const isPublic = (item) => item.visibility !== "private";

/**
 * The journal as the public site may see it: private tracks and entries
 * are dropped (not hidden), and so are entries on a private track.
 */
export function publicJournal(learningTracks, studyLog) {
  const tracks = learningTracks.filter(isPublic);
  const trackIds = new Set(tracks.map((track) => track.id));
  return {
    learningTracks: tracks,
    studyLog: studyLog.filter(
      (entry) => isPublic(entry) && trackIds.has(entry.trackId),
    ),
  };
}
export const listPhotos = () => findOrdered("photos");

const PUBLISHED = { status: "published" };

/**
 * Posts, newest first. Drafts are only included for the admin.
 * @param {{ includeDrafts?: boolean }} [options]
 */
export async function listPosts({ includeDrafts = false } = {}) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.posts)
    .find(includeDrafts ? {} : PUBLISHED, HIDE_ID)
    .sort({ publishedAt: -1, order: 1 })
    .toArray();
}

/** @param {string} slug */
export async function getPublishedPost(slug) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.posts)
    .findOne({ slug, ...PUBLISHED }, HIDE_ID);
}

/** @param {string} slug */
export async function getProject(slug) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS.projects)
    .findOne({ slug, ...VISIBLE }, HIDE_ID);
}

/**
 * Drops references to projects the public snapshot leaves out (hidden
 * ones), so related-project and learning-track links still resolve.
 */
function withoutMissingProjects(projects, learningTracks) {
  const slugs = new Set(projects.map((project) => project.slug));
  const keep = (list = []) => list.filter((slug) => slugs.has(slug));
  return {
    projects: projects.map((project) => ({
      ...project,
      relatedSlugs: keep(project.relatedSlugs),
    })),
    learningTracks: learningTracks.map((track) => ({
      ...track,
      projectSlugs: keep(track.projectSlugs),
    })),
  };
}

function withoutHiddenGrade(entry) {
  if (entry.showGrade) return entry;
  const rest = { ...entry };
  delete rest.grade;
  return rest;
}

/**
 * Everything the public site renders — used by the R7 build snapshot.
 * The admin asks for drafts (and hidden projects) too, so it can edit them.
 * @param {{ includeDrafts?: boolean }} [options]
 */
export async function getContentSnapshot({ includeDrafts = false } = {}) {
  const [
    profile,
    storedProjects,
    organizations,
    experience,
    education,
    skills,
    certifications,
    learning,
    storedTracks,
    settings,
    beyond,
    photos,
    posts,
    storedLog,
  ] = await Promise.all([
    getProfile(),
    listProjects({ includeHidden: includeDrafts }),
    listOrganizations(),
    listExperience(),
    listEducation(),
    listSkills(),
    listCertifications(),
    getLearning(),
    listLearningTracks(),
    getSettings(),
    getBeyond(),
    listPhotos(),
    listPosts({ includeDrafts }),
    listStudyLog(),
  ]);
  const journal = includeDrafts
    ? { learningTracks: storedTracks, studyLog: storedLog }
    : publicJournal(storedTracks, storedLog);
  const { projects, learningTracks } = includeDrafts
    ? { projects: storedProjects, learningTracks: journal.learningTracks }
    : withoutMissingProjects(storedProjects, journal.learningTracks);
  return {
    profile,
    projects,
    organizations,
    experience,
    // A grade only leaves the admin once "Show grade" is ticked (CLAUDE.md:
    // confirm before showing CGPA), so the public bundle never carries it.
    education: includeDrafts ? education : education.map(withoutHiddenGrade),
    skills,
    certifications,
    learning,
    learningTracks,
    studyLog: journal.studyLog,
    settings,
    beyond,
    photos,
    posts,
    github: await getGitHubSnapshot(projects, learningTracks),
    coding: await getCodingSnapshot(),
    books: await getBooksSnapshot(),
  };
}
