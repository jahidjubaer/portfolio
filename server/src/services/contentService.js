import { getDb } from "../db/client.js";
import { COLLECTIONS, SINGLETON_ID } from "../db/collections.js";
import { getGitHubSnapshot } from "./githubSyncService.js";

const HIDE_ID = { projection: { _id: 0 } };

async function findSingleton(name) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS[name])
    .findOne({ _id: SINGLETON_ID }, HIDE_ID);
}

async function findOrdered(name) {
  const db = await getDb();
  return db
    .collection(COLLECTIONS[name])
    .find({}, HIDE_ID)
    .sort({ order: 1 })
    .toArray();
}

export const getProfile = () => findSingleton("profile");
export const getBeyond = () => findSingleton("beyond");
export const getLearning = () => findSingleton("learning");
export const listProjects = () => findOrdered("projects");
export const listOrganizations = () => findOrdered("organizations");
export const listExperience = () => findOrdered("experience");
export const listEducation = () => findOrdered("education");
export const listSkills = () => findOrdered("skills");
export const listCertifications = () => findOrdered("certifications");
export const listLearningTracks = () => findOrdered("learningTracks");
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
  return db.collection(COLLECTIONS.projects).findOne({ slug }, HIDE_ID);
}

function withoutHiddenGrade(entry) {
  if (entry.showGrade) return entry;
  const rest = { ...entry };
  delete rest.grade;
  return rest;
}

/**
 * Everything the public site renders — used by the R7 build snapshot.
 * The admin asks for drafts too, so it can edit them.
 * @param {{ includeDrafts?: boolean }} [options]
 */
export async function getContentSnapshot({ includeDrafts = false } = {}) {
  const [
    profile,
    projects,
    organizations,
    experience,
    education,
    skills,
    certifications,
    learning,
    learningTracks,
    beyond,
    photos,
    posts,
  ] = await Promise.all([
    getProfile(),
    listProjects(),
    listOrganizations(),
    listExperience(),
    listEducation(),
    listSkills(),
    listCertifications(),
    getLearning(),
    listLearningTracks(),
    getBeyond(),
    listPhotos(),
    listPosts({ includeDrafts }),
  ]);
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
    beyond,
    photos,
    posts,
    github: await getGitHubSnapshot(projects),
  };
}
