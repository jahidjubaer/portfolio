import {
  COLLECTIONS,
  KEY_FIELDS,
  SINGLETON_ID,
  ensureIndexes,
} from "./collections.js";

/**
 * Writes seed content into the database. Safe to re-run: by default only
 * documents that don't exist yet are inserted, so edits made later in the
 * admin panel are never overwritten. `overwrite: true` replaces matching
 * documents with the seed version (documents not in the seed are kept).
 * @param {import("mongodb").Db} db
 * @param {import("zod").infer<typeof import("../schemas/content.js").contentSchema>} content
 * @param {{ overwrite?: boolean }} [options]
 * @returns {Promise<Record<string, { inserted: number, updated: number }>>}
 */
export async function seedDatabase(db, content, { overwrite = false } = {}) {
  await ensureIndexes(db);
  const summary = {};

  async function write(name, documents, keyOf) {
    if (documents.length === 0) {
      summary[name] = { inserted: 0, updated: 0 };
      return;
    }
    const operations = documents.map((document) => {
      const filter = keyOf(document);
      return overwrite
        ? { replaceOne: { filter, replacement: document, upsert: true } }
        : {
            updateOne: {
              filter,
              update: { $setOnInsert: document },
              upsert: true,
            },
          };
    });
    const result = await db.collection(COLLECTIONS[name]).bulkWrite(operations);
    summary[name] = {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    };
  }

  const singleton = () => ({ _id: SINGLETON_ID });
  await write("profile", [content.profile], singleton);
  await write("beyond", [content.beyond], singleton);
  await write("learning", [content.learning], singleton);
  for (const name of Object.keys(KEY_FIELDS)) {
    const key = KEY_FIELDS[name];
    await write(name, content[name], (document) => ({ [key]: document[key] }));
  }
  return summary;
}
