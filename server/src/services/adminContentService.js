import { getDb } from "../db/client.js";
import { COLLECTIONS, KEY_FIELDS, SINGLETON_ID } from "../db/collections.js";
import {
  beyondSchema,
  certificationSchema,
  experienceSchema,
  photoSchema,
  postSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
} from "../schemas/content.js";
import { deleteUpload } from "./uploadService.js";
import { markEdited } from "./publishService.js";

const HIDE_ID = { projection: { _id: 0 } };

export const SINGLETON_SCHEMAS = {
  profile: profileSchema,
  beyond: beyondSchema,
};

export const LIST_SCHEMAS = {
  projects: projectSchema,
  experience: experienceSchema,
  skills: skillGroupSchema,
  certifications: certificationSchema,
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

/** @param {"profile" | "beyond"} name */
export async function replaceSingleton(name, input) {
  const document = validate(SINGLETON_SCHEMAS[name], input);
  const db = await getDb();
  await db
    .collection(COLLECTIONS[name])
    .replaceOne({ _id: SINGLETON_ID }, document, { upsert: true });
  await markEdited();
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
  try {
    await collection.insertOne({ ...document });
  } catch (error) {
    if (error.code === 11000) {
      throw httpError(409, `"${document[KEY_FIELDS[name]]}" already exists.`);
    }
    throw error;
  }
  await markEdited();
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
  await collection.replaceOne({ [keyField]: key }, document);
  await markEdited();
  return document;
}

/**
 * Deletes one item. A photo's uploaded file goes with it; other uploads
 * (post covers, images inside Markdown) may be shared, so they stay.
 * @param {keyof typeof LIST_SCHEMAS} name @param {string} key
 */
export async function deleteItem(name, key) {
  const db = await getDb();
  const deleted = await db
    .collection(COLLECTIONS[name])
    .findOneAndDelete({ [KEY_FIELDS[name]]: key });
  if (!deleted) throw httpError(404, "Item not found.");
  await markEdited();
  if (name === "photos") await deleteUpload(deleted.image?.url);
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
  await markEdited();
}
