/**
 * Brings stored content up to the current schemas.
 *
 *   npm run migrate -w server                 apply
 *   npm run migrate -w server -- --dry-run    only report what would change
 *
 * Needs MONGODB_URI (server/.env, or `vercel env pull`).
 */
import { buildSeedContent } from "./seed-content.js";
import { migrateCaseStudies } from "../src/db/migrations.js";
import { closeDb, getDb, isDatabaseConfigured } from "../src/db/client.js";
import { env } from "../src/config/env.js";

if (!isDatabaseConfigured()) {
  console.error("MONGODB_URI is not set. Add it to server/.env first.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

try {
  const db = await getDb();
  const result = await migrateCaseStudies(db, buildSeedContent().projects, {
    dryRun,
  });
  const verb = dryRun ? "Would convert" : "Converted";
  console.log(`Database "${env.mongodbDb}"${dryRun ? " (dry run)" : ""}:`);
  console.log(`${verb} case studies: ${result.converted.join(", ") || "none"}`);
  if (result.manual.length) {
    console.log(
      `Old-format case studies with no seed version (edit in /admin): ${result.manual.join(", ")}`,
    );
  }
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
