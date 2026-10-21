/**
 * The docs/14 (R2) data change: case studies lose their screenshot
 * galleries (a project has one cover picture now), and Sarabo's case study
 * moves into the five-section template.
 *
 *   npm run migrate:case-study-template -w server -- --dry-run
 *   npm run migrate:case-study-template -w server
 *
 * Sarabo is only rewritten while it still has its old sections, so running
 * this twice changes nothing. Needs MONGODB_URI (server/.env).
 */
import { closeDb, getDb, isDatabaseConfigured } from "../src/db/client.js";
import { updateItem } from "../src/services/adminContentService.js";
import { migrateProject } from "./case-study-template-data.js";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("MONGODB_URI isn't set (server/.env).");
    process.exitCode = 1;
    return;
  }
  const db = await getDb();
  const projects = await db
    .collection("projects")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  for (const project of projects) {
    const next = migrateProject(project);
    if (!next) {
      console.log(`${project.slug}: nothing to change`);
      continue;
    }
    if (dryRun) {
      console.log(`${project.slug}: would save`);
      console.log(JSON.stringify(next.caseStudy.sections, null, 2));
      continue;
    }
    await updateItem("projects", project.slug, next);
    console.log(`${project.slug}: saved`);
  }
  if (dryRun) console.log("\nDry run: nothing saved.");
  else console.log("\nPublish from /admin to show the changes.");
}

await main().finally(closeDb);
