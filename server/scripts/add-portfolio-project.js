/**
 * The docs/11 (D) import: adds the `portfolio` repo as a project that is
 * hidden until Jahid has reviewed it (admin → Projects → untick
 * "Hidden"). Skips if the slug already exists.
 *
 *   npm run add:portfolio-project -w server -- --dry-run
 *   npm run add:portfolio-project -w server
 *
 * Run it only once the docs/11 code is deployed: older deployments don't
 * know `hidden`, so a publish from them would show the draft publicly.
 * Needs MONGODB_URI (server/.env).
 */
import { closeDb, isDatabaseConfigured } from "../src/db/client.js";
import { listProjects } from "../src/services/contentService.js";
import { createItem } from "../src/services/adminContentService.js";
import { PORTFOLIO_PROJECT } from "./portfolio-project.js";

const dryRun = process.argv.includes("--dry-run");

if (!isDatabaseConfigured()) {
  console.error("MONGODB_URI isn't set (server/.env).");
  process.exit(1);
}

const existing = await listProjects({ includeHidden: true });
if (existing.some((project) => project.slug === PORTFOLIO_PROJECT.slug)) {
  console.log(`A project "${PORTFOLIO_PROJECT.slug}" already exists; skipped.`);
} else if (dryRun) {
  console.log(JSON.stringify(PORTFOLIO_PROJECT, null, 2));
  console.log("\nDry run: nothing saved.");
} else {
  await createItem("projects", PORTFOLIO_PROJECT);
  console.log(
    `Added "${PORTFOLIO_PROJECT.title}" as a hidden project. Review it in /admin → Projects.`,
  );
}
await closeDb();
