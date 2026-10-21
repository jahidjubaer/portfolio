import { getDb } from "../db/client.js";
import { COLLECTIONS, KEY_FIELDS, SINGLETON_ID } from "../db/collections.js";
import {
  beyondSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  findBrokenReferences,
  learningSchema,
  learningTrackSchema,
  organizationSchema,
  studyLogSchema,
  photoSchema,
  postSchema,
  profileSchema,
  projectSchema,
  settingsSchema,
  skillGroupSchema,
} from "../schemas/content.js";
import { deleteUpload } from "./uploadService.js";
import { markEdited } from "./publishService.js";

const HIDE_ID = { projection: { _id: 0 } };

export const SINGLETON_SCHEMAS = {
  profile: profileSchema,
  beyond: beyondSchema,
  learning: learningSchema,
  settings: settingsSchema,
};

export const LIST_SCHEMAS = {
  projects: projectSchema,
  organizations: organizationSchema,
  experience: experienceSchema,
  education: educationSchema,
  skills: skillGroupSchema,
  certifications: certificationSchema,
  learningTracks: learningTrackSchema,
  studyLog: studyLogSchema,
  photos: photoSchema,
  posts: postSchema,
};

function httpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

/**
 * Validates with a content schema; throws 400 with per-field issues that
 * the admin form shows next to each field.
 */
export function validate(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw httpError(
      400,
      "Some fields need attention.",
      result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

// Lists that hold ids of other items, and the lists those ids point into.
const REFERENCES = {
  experience: ["organizations"],
  education: ["organizations"],
  certifications: ["organizations"],
  learningTracks: ["organizations", "certifications", "projects"],
  studyLog: ["learningTracks"],
};
const REFERENCED_BY = {
  organizations: [
    "experience",
    "education",
    "certifications",
    "learningTracks",
  ],
  certifications: ["learningTracks"],
  projects: ["learningTracks"],
  learningTracks: ["studyLog"],
};

async function loadLists(db, names) {
  const lists = await Promise.all(
    names.map((name) =>
      db.collection(COLLECTIONS[name]).find({}, HIDE_ID).toArray(),
    ),
  );
  return Object.fromEntries(names.map((name, index) => [name, lists[index]]));
}

/** 400 when a saved item points at an organization (etc.) that doesn't exist. */
async function checkReferences(db, name, document) {
  if (!REFERENCES[name]) return;
  const content = await loadLists(db, REFERENCES[name]);
  // Only the saved item's own ids; the lists it points into are loaded
  // without their own targets, so their references can't be judged here.
  const issues = findBrokenReferences({
    ...content,
    [name]: [document],
  }).filter((issue) => issue.path[0] === name);
  if (issues.length) {
    throw httpError(
      400,
      "Some fields need attention.",
      issues.map((issue) => ({
        path: issue.path.slice(2).join("."),
        message: issue.message,
      })),
    );
  }
}

/**
 * 409 when other items still point at the one being deleted: any reference
 * that resolves now but wouldn't once it's gone.
 */
async function checkNotReferenced(db, name, key) {
  if (!REFERENCED_BY[name]) return;
  const content = await loadLists(db, [
    ...new Set([
      name,
      ...REFERENCED_BY[name].flatMap((user) => [user, ...REFERENCES[user]]),
    ]),
  ]);
  const describe = (issue) => `${issue.path.join(".")} ${issue.message}`;
  const before = new Set(findBrokenReferences(content).map(describe));
  const after = findBrokenReferences({
    ...content,
    [name]: content[name].filter((item) => item[KEY_FIELDS[name]] !== key),
  }).filter((issue) => !before.has(describe(issue)));
  const users = [...new Set(after.map((issue) => issue.path[0]))];
  if (users.length) {
    throw httpError(
      409,
      `It's still used in ${users.join(", ")}. Change those first.`,
    );
  }
}

/** A change-log entry for one list item, named the way the admin lists it. */
function changeOf(name, item, action) {
  const key = item[KEY_FIELDS[name]];
  const label =
    item.title ??
    item.name ??
    item.degree ??
    item.caption ??
    item.alt ??
    item.topic ??
    key;
  return { collection: name, key, label: String(label).slice(0, 120), action };
}

/** @param {keyof typeof SINGLETON_SCHEMAS} name */
export async function replaceSingleton(name, input) {
  const document = validate(SINGLETON_SCHEMAS[name], input);
  const db = await getDb();
  await db
    .collection(COLLECTIONS[name])
    .replaceOne({ _id: SINGLETON_ID }, document, { upsert: true });
  await markEdited({ collection: name, action: "updated" });
  return document;
}

/**
 * Adds an item at the end of the list. `order` is assigned here, so the
 * form never has to know it.
 * @param {keyof typeof LIST_SCHEMAS} name
 */
export async function createItem(name, input) {
  const db = await getDb();
  const collection = db.collection(COLLECTIONS[name]);
  const [last] = await collection
    .find({}, { projection: { order: 1 } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const document = validate(LIST_SCHEMAS[name], {
    ...input,
    order: last ? last.order + 1 : 0,
  });
  await checkReferences(db, name, document);
  try {
    await collection.insertOne({ ...document });
  } catch (error) {
    if (error.code === 11000) {
      throw httpError(409, `"${document[KEY_FIELDS[name]]}" already exists.`);
    }
    throw error;
  }
  await markEdited(changeOf(name, document, "created"));
  return document;
}

/**
 * Replaces one item. The key (slug/id) can't change here — renaming would
 * break links to it — and the stored `order` is kept.
 * @param {keyof typeof LIST_SCHEMAS} name
 * @param {string} key
 */
export async function updateItem(name, key, input) {
  const keyField = KEY_FIELDS[name];
  if (input?.[keyField] !== undefined && input[keyField] !== key) {
    throw httpError(400, `The ${keyField} can't be changed.`);
  }
  const db = await getDb();
  const collection = db.collection(COLLECTIONS[name]);
  const existing = await collection.findOne({ [keyField]: key }, HIDE_ID);
  if (!existing) throw httpError(404, "Item not found.");
  const document = validate(LIST_SCHEMAS[name], {
    ...input,
    [keyField]: key,
    order: existing.order,
  });
  await checkReferences(db, name, document);
  await collection.replaceOne({ [keyField]: key }, document);
  await markEdited(changeOf(name, document, "updated"));
  return document;
}

/**
 * Deletes one item. A photo's, logo's, or certificate's uploaded file goes
 * with it; other uploads (post covers, images inside Markdown) may be
 * shared, so they stay. Items still referenced elsewhere can't be deleted.
 * @param {keyof typeof LIST_SCHEMAS} name @param {string} key
 */
export async function deleteItem(name, key) {
  const db = await getDb();
  await checkNotReferenced(db, name, key);
  const deleted = await db
    .collection(COLLECTIONS[name])
    .findOneAndDelete({ [KEY_FIELDS[name]]: key });
  if (!deleted) throw httpError(404, "Item not found.");
  await markEdited(changeOf(name, deleted, "deleted"));
  if (name === "photos") await deleteUpload(deleted.image?.url);
  // A logo or certificate image belongs to its one item.
  if (name === "organizations") await deleteUpload(deleted.logo?.url);
  if (name === "certifications") await deleteUpload(deleted.image?.url);
}

/**
 * Sets the display order. `keys` must list every item exactly once, so a
 * stale admin tab can't silently drop or duplicate positions.
 * @param {keyof typeof LIST_SCHEMAS} name
 * @param {unknown} keys
 */
export async function reorderItems(name, keys) {
  const keyField = KEY_FIELDS[name];
  const db = await getDb();
  const collection = db.collection(COLLECTIONS[name]);
  const current = await collection
    .find({}, { projection: { [keyField]: 1 } })
    .toArray();
  const currentKeys = current.map((item) => item[keyField]).sort();
  const isPermutation =
    Array.isArray(keys) &&
    keys.length === currentKeys.length &&
    new Set(keys).size === keys.length &&
    [...keys].sort().every((key, index) => key === currentKeys[index]);
  if (!isPermutation) {
    throw httpError(400, "The order must list every item exactly once.");
  }
  await collection.bulkWrite(
    keys.map((key, order) => ({
      updateOne: { filter: { [keyField]: key }, update: { $set: { order } } },
    })),
  );
  await markEdited({ collection: name, action: "reordered" });
}
