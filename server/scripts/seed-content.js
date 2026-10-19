/**
 * The content the database is seeded with: the published snapshot
 * (client/src/generated/content.json, written by export-content.js), so a
 * fresh database starts from what the live site shows. Runs under
 * vite-node (see the "seed" script) like the other content scripts.
 */
import snapshot from "../../client/src/generated/content.json";
import { contentSchema } from "../src/schemas/content.js";
import { withDefaultSettings } from "../src/schemas/settings-defaults.js";

/** @returns {import("zod").infer<typeof contentSchema>} */
export function buildSeedContent() {
  // Parsing drops the GitHub cache and anything the schemas don't know,
  // and returns fresh objects, so callers can't change the snapshot.
  // A snapshot written before settings existed gets the defaults.
  return contentSchema.parse({
    ...structuredClone(snapshot),
    settings: withDefaultSettings(snapshot.settings),
  });
}
