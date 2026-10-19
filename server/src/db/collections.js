/**
 * Collection names. `profile`, `beyond`, and `learning` hold a single document with
 * `_id: SINGLETON_ID`; the rest are lists keyed by `KEY_FIELDS` and shown
 * in ascending `order`.
 */
export const COLLECTIONS = {
  profile: "profile",
  projects: "projects",
  organizations: "organizations",
  experience: "experience",
  education: "education",
  skills: "skills",
  certifications: "certifications",
  learning: "learning",
  learningTracks: "learningTracks",
  beyond: "beyond",
  photos: "photos",
  posts: "posts",
  // GitHub sync cache (R6): one document per public repo, keyed by
  // GitHub's numeric id, plus a singleton with the last sync's result.
  githubRepos: "githubRepos",
  githubSync: "githubSync",
  // Publish (R7): when content last changed (singleton) and each publish.
  siteState: "siteState",
  publishLog: "publishLog",
};

export const SINGLETON_ID = "main";

export const KEY_FIELDS = {
  projects: "slug",
  organizations: "id",
  experience: "id",
  education: "id",
  skills: "id",
  certifications: "id",
  learningTracks: "id",
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
