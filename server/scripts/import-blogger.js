/**
 * One-time import of the Blogger blogs into the database (R8). Every image
 * is downloaded and re-uploaded to Vercel Blob, so nothing on the site
 * depends on Blogger afterwards. Already-imported items are skipped.
 *
 *   npm run import:blogger -w server -- --dry-run    report only
 *   npm run import:blogger -w server                 import
 *
 * Needs MONGODB_URI and BLOB_READ_WRITE_TOKEN (server/.env). Press Publish
 * in /admin afterwards.
 */
import { put } from "@vercel/blob";
import { closeDb, getDb, isDatabaseConfigured } from "../src/db/client.js";
import { imageDimensions, importBlogger } from "../src/db/blogger-import.js";
import { markEdited } from "../src/services/publishService.js";
import { env } from "../src/config/env.js";

const PHOTO_BLOG = "https://jahid-thecapturecrew.blogspot.com";
const NOTES_BLOG = "https://jahider-notekhata.blogspot.com";

// Blogger gave these posts dated, generic URLs ("2025/08/blog-post").
const SLUGS = {
  [`${NOTES_BLOG}/2025/09/javascript_12.html`]:
    "javascript-where-to-write-code",
  [`${NOTES_BLOG}/2025/09/javascript.html`]: "javascript-introduction",
  [`${NOTES_BLOG}/2025/08/blog-post.html`]: "napkin-ai-presentations",
};

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function fetchEntries(blog) {
  const response = await fetch(
    `${blog}/feeds/posts/default?alt=json&max-results=500`,
    { signal: AbortSignal.timeout(20_000) },
  );
  if (!response.ok) throw new Error(`${blog} feed: HTTP ${response.status}`);
  return (await response.json()).feed?.entry ?? [];
}

let uploads = 0;

/** Downloads a Blogger image and uploads it to Vercel Blob. */
async function rehost(src) {
  const response = await fetch(src, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Image ${src}: HTTP ${response.status}`);
  const contentType = response.headers.get("content-type")?.split(";")[0];
  const extension = EXTENSIONS[contentType];
  if (!extension) throw new Error(`Image ${src}: unexpected ${contentType}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const size = imageDimensions(bytes);
  if (!size) throw new Error(`Image ${src}: couldn't read its size`);

  const blob = await put(`photos/blogger.${extension}`, bytes, {
    access: "public",
    addRandomSuffix: true,
    contentType,
    token: env.blobToken,
  });
  uploads += 1;
  process.stdout.write(".");
  return { url: blob.url, ...size };
}

if (!isDatabaseConfigured()) {
  console.error("MONGODB_URI is not set. Add it to server/.env first.");
  process.exit(1);
}
const dryRun = process.argv.includes("--dry-run");
if (!dryRun && !env.blobToken) {
  console.error(
    "BLOB_READ_WRITE_TOKEN is not set. Add it to server/.env first.",
  );
  process.exit(1);
}

try {
  const [photoEntries, postEntries] = await Promise.all([
    fetchEntries(PHOTO_BLOG),
    fetchEntries(NOTES_BLOG),
  ]);
  const db = await getDb();
  const report = await importBlogger(db, {
    photoEntries,
    postEntries,
    rehost,
    slugs: SLUGS,
    dryRun,
  });
  if (uploads) console.log(`\nUploaded ${uploads} images.`);
  if (!dryRun && (report.photos.length || report.posts.length)) {
    await markEdited();
  }

  const verb = dryRun ? "Would import" : "Imported";
  console.log(`Database "${env.mongodbDb}"${dryRun ? " (dry run)" : ""}:`);
  console.log(`${verb} ${report.photos.length} photos:`);
  for (const photo of report.photos) {
    console.log(`  ${photo.id} [${photo.album}] ${photo.caption}`);
  }
  console.log(`${verb} ${report.posts.length} posts:`);
  for (const post of report.posts) {
    console.log(
      `  /writing/${post.slug} (${post.publishedAt}) ${post.title}\n    tags: ${post.tags.join(", ")}; cover: ${post.cover ? "yes" : "no"}; ${post.imageCount} images in the body; ${post.body.length} characters`,
    );
  }
  if (report.skipped.length) {
    console.log(`Already imported: ${report.skipped.join(", ")}`);
  }
} catch (error) {
  console.error("\nImport failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeDb();
}
