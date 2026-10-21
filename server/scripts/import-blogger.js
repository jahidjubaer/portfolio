/**
 * One-time import of the Blogger blogs into the database (R8; the personal
 * blog's posts arrive as drafts, docs/14 R5). Every image
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
// The personal blog (docs/14 R5): imported as drafts of kind "blog".
const PERSONAL_BLOG = "https://mdjahid-hasan.blogspot.com";

// Blogger gave these posts dated, generic URLs ("2025/08/blog-post").
const SLUGS = {
  [`${NOTES_BLOG}/2025/09/javascript_12.html`]:
    "javascript-where-to-write-code",
  [`${NOTES_BLOG}/2025/09/javascript.html`]: "javascript-introduction",
  [`${NOTES_BLOG}/2025/08/blog-post.html`]: "napkin-ai-presentations",
  [`${PERSONAL_BLOG}/2022/08/blog-post_93.html`]: "niladri-lake-part-3",
  [`${PERSONAL_BLOG}/2022/08/blog-post_18.html`]: "niladri-lake-part-2",
  [`${PERSONAL_BLOG}/2022/08/blog-post.html`]: "niladri-lake-part-1",
  [`${PERSONAL_BLOG}/2022/03/blog-post.html`]:
    "cricket-video-games-and-lost-promise",
  [`${PERSONAL_BLOG}/2021/10/blog-post_17.html`]: "comilla-communal-violence",
  [`${PERSONAL_BLOG}/2021/10/blog-post.html`]:
    "quran-desecration-politics-and-media",
  [`${PERSONAL_BLOG}/2021/08/blog-post.html`]: "jamuna-group-and-evaly",
  [`${PERSONAL_BLOG}/2021/05/blog-post_29.html`]: "pubg-free-fire-ban",
  [`${PERSONAL_BLOG}/2021/05/blog-post_55.html`]: "corona-and-careless-crowds",
  [`${PERSONAL_BLOG}/2021/05/blog-post_10.html`]: "takerghat-tourism-and-noise",
  [`${PERSONAL_BLOG}/2021/05/blog-post_8.html`]: "battle-of-ain-jalut",
  [`${PERSONAL_BLOG}/2021/05/blog-post_7.html`]: "luxury-as-a-nation",
  [`${PERSONAL_BLOG}/2021/05/blog-post.html`]: "mosque-committees-today",
  [`${PERSONAL_BLOG}/2021/03/blog-post_13.html`]: "moral-decline",
  [`${PERSONAL_BLOG}/2021/03/blog-post_38.html`]: "golden-childhood",
  [`${PERSONAL_BLOG}/2021/03/blog-post_23.html`]: "national-leaders-and-titles",
  [`${PERSONAL_BLOG}/2021/03/blog-post_9.html`]: "news-portal-headlines",
  [`${PERSONAL_BLOG}/2021/03/blog-post.html`]: "bdr-mutiny-2009",
  [`${PERSONAL_BLOG}/2020/04/blog-post_22.html`]: "facebook-islamic-groups",
  [`${PERSONAL_BLOG}/2020/04/blog-post_66.html`]:
    "circulars-directives-and-corona",
  [`${PERSONAL_BLOG}/2020/04/blog-post.html`]: "corona-lives-and-economy",
  [`${PERSONAL_BLOG}/2020/03/blog-post.html`]: "lockdown-and-ordinary-people",
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
  const [photoEntries, postEntries, blogEntries] = await Promise.all([
    fetchEntries(PHOTO_BLOG),
    fetchEntries(NOTES_BLOG),
    fetchEntries(PERSONAL_BLOG),
  ]);
  const db = await getDb();
  const report = await importBlogger(db, {
    photoEntries,
    postEntries,
    blogEntries,
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
      `  /writing/${post.slug} (${post.publishedAt}${post.kind ? `, ${post.kind}, ${post.status}` : ""}) ${post.title}\n    tags: ${post.tags.join(", ")}; cover: ${post.cover ? "yes" : "no"}; ${post.imageCount} images in the body; ${post.body.length} characters`,
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
