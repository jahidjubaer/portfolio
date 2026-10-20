/**
 * The docs/11 (C) migration: a kind (certification | course) and a
 * category (professional | leadership-community) for every existing
 * certification. Prints the proposal by default; nothing is saved until
 * Jahid has reviewed it and runs it with --apply.
 *
 *   npm run migrate:certifications -w server            (proposal only)
 *   npm run migrate:certifications -w server -- --apply
 *
 * Needs MONGODB_URI (server/.env). Press Publish in /admin afterwards.
 * Items not listed here are left alone and stay flagged in the admin.
 */
import { closeDb, isDatabaseConfigured } from "../src/db/client.js";
import { listCertifications } from "../src/services/contentService.js";
import { updateItem } from "../src/services/adminContentService.js";

// Rule of thumb: a course or training that was studied is a "course"; a
// certificate for an assessment, programme, or event is a "certification".
// Leadership & community covers scouting, the Red Crescent, and clubs.
export const PROPOSALS = {
  "programming-hero-complete-web-development": ["course", "professional"],
  "learn-with-sumit-reactive-accelerator": ["course", "professional"],
  "edge-python-data-science": ["certification", "professional"],
  "employability-skills": ["certification", "professional"],
  "kaggle-python": ["certification", "professional"],
  "kaggle-pandas": ["certification", "professional"],
  "sust-path-to-academic-excellence": ["course", "professional"],
  "ononno-deep-focus": ["course", "professional"],
  "mups-photography-workshop-2023": ["course", "leadership-community"],
  "bdrcs-basic-first-aid": ["course", "leadership-community"],
  "scouts-patrol-leader-course": ["course", "leadership-community"],
  // Imported from LinkedIn, where every item was a "certification".
  "photography-basics": ["course", "professional"],
  "innovation-through-research-a-pathway-to-higher-education-an": [
    "course",
    "professional",
  ],
  "first-aid-disaster-response-camp": ["course", "leadership-community"],
  "bangladesh-scouts-2018-01": ["certification", "leadership-community"],
  "bangladesh-scouts-2017-03": ["certification", "leadership-community"],
};

const apply = process.argv.includes("--apply");

if (!isDatabaseConfigured()) {
  console.error("MONGODB_URI isn't set (server/.env).");
  process.exit(1);
}

const items = await listCertifications();
let changed = 0;
for (const item of items) {
  const proposal = PROPOSALS[item.id];
  if (!proposal) {
    console.log(`no proposal   ${item.title}`);
    continue;
  }
  const [kind, category] = proposal;
  const same = item.kind === kind && item.category === category;
  const note = item.kind === kind ? "" : ` (was ${item.kind})`;
  console.log(
    `${same ? "unchanged    " : "change       "} ${kind}${note} · ${category} · ${item.title}`,
  );
  if (same) continue;
  changed += 1;
  if (apply)
    await updateItem("certifications", item.id, { ...item, kind, category });
}

console.log(
  apply
    ? `\nSaved ${changed} change(s). Press Publish in /admin.`
    : `\n${changed} change(s) proposed. Nothing saved; run with --apply after review.`,
);
await closeDb();
