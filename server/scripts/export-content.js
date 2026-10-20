/**
 * Build step (R7): writes the published content from MongoDB to
 * client/src/generated/content.json, which the public site is built from.
 *
 *   npm run content:export -w server
 *
 * Runs before every production build (root "build" script), so a Publish
 * from the admin always ships the database as it is. When the database
 * isn't configured or reachable, or its content doesn't pass the schemas,
 * the committed snapshot is kept and the build continues with it — the
 * site never goes down because Atlas is. Drafts are never exported.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getContentSnapshot } from "../src/services/contentService.js";
import { closeDb, isDatabaseConfigured } from "../src/db/client.js";
import { contentSchema } from "../src/schemas/content.js";

const SNAPSHOT_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../client/src/generated/content.json",
);

function keepCommittedSnapshot(reason) {
  if (!existsSync(SNAPSHOT_FILE)) {
    console.error(
      `[content] ${reason}, and there is no snapshot to fall back on.`,
    );
    process.exitCode = 1;
    return;
  }
  console.warn(`[content] ${reason}. Building with the committed snapshot.`);
}

async function main() {
  if (!isDatabaseConfigured()) {
    keepCommittedSnapshot("MONGODB_URI is not set");
    return;
  }
  let snapshot;
  try {
    snapshot = await getContentSnapshot();
  } catch (error) {
    keepCommittedSnapshot(`Couldn't read the database (${error.message})`);
    return;
  } finally {
    await closeDb();
  }

  // Synced caches aren't edited content, so the schema doesn't cover them.
  const { github, coding, ...content } = snapshot;
  const result = contentSchema.safeParse(content);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    keepCommittedSnapshot(`The database content is invalid (${issues})`);
    return;
  }

  const json = `${JSON.stringify({ ...result.data, github, coding }, null, 2)}\n`;
  const previous = existsSync(SNAPSHOT_FILE)
    ? readFileSync(SNAPSHOT_FILE, "utf8")
    : "";
  if (json === previous) {
    console.log("[content] Snapshot is up to date.");
    return;
  }
  writeFileSync(SNAPSHOT_FILE, json);
  console.log(
    `[content] Wrote the snapshot: ${result.data.projects.length} projects, ${result.data.posts.length} posts, ${result.data.photos.length} photos.`,
  );
}

await main();
