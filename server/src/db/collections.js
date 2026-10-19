/**
 * Collection names. `profile` and `beyond` hold a single document with
 * `_id: SINGLETON_ID`; the rest are lists keyed by `KEY_FIELDS` and shown
 * in ascending `order`.
 */
export const COLLECTIONS = {
  profile: "profile",
  projects: "projects",
  experience: "experience",
  skills: "skills",
  certifications: "certifications",
  beyond: "beyond",
  photos: "photos",
  posts: "posts",
  // GitHub sync cache (R6): one document per public repo, keyed by
  // GitHub's numeric id, plus a singleton with the last sync's result.
  githubRepos: "githubRepos",
  githubSync: "githubSync",
};

export const SINGLETON_ID = "main";

export const KEY_FIELDS = {
  projects: "slug",
  experience: "id",
  skills: "id",
  certifications: "id",
  photos: "id",
  posts: "slug",
};

/** @param {import("mongodb").Db} db */
export async function ensureIndexes(db) {
  await Promise.all([
    ...Object.entries(KEY_FIELDS).map(([name, key]) =>
      db
        .collection(COLLECTIONS[name])
        .createIndex({ [key]: 1 }, { unique: true }),
    ),
    db
      .collection(COLLECTIONS.githubRepos)
      .createIndex({ id: 1 }, { unique: true }),
  ]);
}
