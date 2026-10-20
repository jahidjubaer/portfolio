/**
 * Imports career items from a LinkedIn data export (docs/08, R5c): the
 * same mapping as the admin's "Import from LinkedIn" page. Only items that
 * aren't on the site yet are added; nothing is overwritten.
 *
 *   npm run import:linkedin -w server -- <export folder> --dry-run
 *   npm run import:linkedin -w server -- <export folder>
 *
 * Needs MONGODB_URI (server/.env). Press Publish in /admin afterwards.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { closeDb, isDatabaseConfigured } from "../src/db/client.js";
import {
  buildLinkedInImport,
  LINKEDIN_FILES,
} from "../src/db/linkedin-import.js";
import { getContentSnapshot } from "../src/services/contentService.js";
import { createItem } from "../src/services/adminContentService.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const folder = args.find((arg) => !arg.startsWith("--"));

if (!folder) {
  console.error("Usage: import-linkedin <export folder> [--dry-run]");
  process.exit(1);
}
if (!isDatabaseConfigured()) {
  console.error("MONGODB_URI isn't set (server/.env).");
  process.exit(1);
}

const files = {};
for (const name of LINKEDIN_FILES) {
  try {
    files[name] = await readFile(path.join(folder, name), "utf8");
  } catch {
    // Not every export has every file (no jobs → no Positions.csv).
  }
}

const content = await getContentSnapshot({ includeDrafts: true });
const { candidates, skipped } = buildLinkedInImport(files, content);
const toAdd = candidates.filter((candidate) => !candidate.exists);

for (const candidate of candidates) {
  const mark = candidate.exists ? "skip (on the site)" : "add";
  console.log(`${mark.padEnd(19)} ${candidate.collection}: ${candidate.label}`);
}
for (const item of skipped) {
  console.log(`skip (${item.reason}) ${item.file}: ${item.label}`);
}

if (!dryRun) {
  const createdOrgs = new Set();
  for (const candidate of toAdd) {
    const org = candidate.newOrganization;
    if (org && !createdOrgs.has(org.id)) {
      await createItem("organizations", org);
      createdOrgs.add(org.id);
    }
    await createItem(candidate.collection, candidate.item);
  }
  console.log(
    `Added ${toAdd.length} items and ${createdOrgs.size} organizations. Publish from /admin to put them on the site.`,
  );
}
await closeDb();
