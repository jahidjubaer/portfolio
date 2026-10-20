/**
 * The docs/12 (S2) data: Sarabo's architecture diagram. Turns its
 * Architecture section into a diagram section (the text stays above the
 * diagram) and adds the parts and steps. Skips if Sarabo already has one.
 *
 *   npm run add:sarabo-architecture -w server -- --dry-run
 *   npm run add:sarabo-architecture -w server
 *
 * The facts behind each step are listed in sarabo-architecture-data.js.
 * Needs MONGODB_URI (server/.env).
 */
import { closeDb, isDatabaseConfigured } from "../src/db/client.js";
import { getProject } from "../src/services/contentService.js";
import { updateItem } from "../src/services/adminContentService.js";
import { withArchitecture } from "./sarabo-architecture-data.js";

const SLUG = "sarabo";
const SECTION_ID = "architecture";
const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!isDatabaseConfigured()) {
    console.error("MONGODB_URI isn't set (server/.env).");
    process.exitCode = 1;
    return;
  }
  const project = await getProject(SLUG);
  if (!project?.caseStudy) {
    console.error(`No "${SLUG}" case study found.`);
    process.exitCode = 1;
    return;
  }
  if (project.caseStudy.architecture) {
    console.log(`"${SLUG}" already has an architecture diagram; skipped.`);
    return;
  }
  if (!project.caseStudy.sections.some((s) => s.id === SECTION_ID)) {
    console.error(`"${SLUG}" has no "${SECTION_ID}" section to attach it to.`);
    process.exitCode = 1;
    return;
  }
  const next = withArchitecture(project);
  if (dryRun) {
    console.log(JSON.stringify(next.caseStudy.architecture, null, 2));
    console.log("\nDry run: nothing saved.");
    return;
  }
  await updateItem("projects", SLUG, next);
  console.log(
    `Added the architecture diagram to "${SLUG}". Publish from /admin to show it.`,
  );
}

await main().finally(closeDb);
