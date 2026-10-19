/**
 * Brings stored content up to the current schemas.
 *
 *   npm run migrate -w server                 apply
 *   npm run migrate -w server -- --dry-run    only report what would change
 *
 * Needs MONGODB_URI (server/.env, or `vercel env pull`).
 */
import { buildSeedContent } from "./seed-content.js";
import {
  migrateCaseStudies,
  migrateToOrganizations,
} from "../src/db/migrations.js";
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

  const p2 = await migrateToOrganizations(db, { dryRun });
  if (p2.skipped) {
    console.log("Organizations: already migrated.");
  } else {
    const verbP2 = dryRun ? "Would create" : "Created";
    console.log(
      `${verbP2} ${p2.organizations.length} organizations: ${p2.organizations.map((item) => item.name).join("; ")}`,
    );
    for (const item of p2.experience) {
      console.log(
        `  Experience at ${item.organizationId}: ${item.roles.map((role) => `${role.title} (${role.start}–${role.end ?? "present"})`).join(", ")}`,
      );
    }
    for (const item of p2.education) {
      console.log(
        `  Education: ${item.degree}, ${item.field ?? ""} → ${item.organizationId}`,
      );
    }
    console.log(
      `  Certifications linked to organizations: ${p2.certifications.length}`,
    );
  }
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
