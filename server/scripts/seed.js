/**
 * One-time migration of client/src/data/* into MongoDB.
 *
 *   npm run seed -w server              insert anything missing
 *   npm run seed -w server -- --overwrite   reset documents to the seed
 *
 * Needs MONGODB_URI (server/.env, or `vercel env pull`).
 */
import { buildSeedContent } from "./seed-content.js";
import { seedDatabase } from "../src/db/seed.js";
import { closeDb, getDb, isDatabaseConfigured } from "../src/db/client.js";
import { env } from "../src/config/env.js";

if (!isDatabaseConfigured()) {
  console.error("MONGODB_URI is not set. Add it to server/.env first.");
  process.exit(1);
}

const overwrite = process.argv.includes("--overwrite");

try {
  const content = buildSeedContent();
  const db = await getDb();
  const summary = await seedDatabase(db, content, { overwrite });
  console.log(
    `Seeded database "${env.mongodbDb}"${overwrite ? " (overwrite)" : ""}:`,
  );
  console.table(summary);
} catch (error) {
  console.error("Seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
