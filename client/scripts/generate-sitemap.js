/**
 * Generates client/public/sitemap.xml and robots.txt from the public,
 * indexable routes in src/routes/route-meta.js — the same list the
 * prerender step writes HTML for — using the published content snapshot
 * for project slugs, so the sitemap can never drift from the data.
 *
 * The base URL comes from VITE_SITE_URL / Vercel (see site-url.js) and
 * falls back to the local dev origin, never a made-up production domain.
 * Error/404 states and /admin are never listed.
 *
 * Regenerate via `npm run seo:generate` (also run automatically in prebuild).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSiteUrl } from "./site-url.js";
import { getPublicRoutes } from "../src/routes/route-meta.js";

const CLIENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_FILE = join(CLIENT_ROOT, "src", "generated", "content.json");
const SITEMAP_FILE = join(CLIENT_ROOT, "public", "sitemap.xml");
const ROBOTS_FILE = join(CLIENT_ROOT, "public", "robots.txt");

/**
 * @param {string} siteUrl
 * @param {string[]} paths site-relative, e.g. "/", "/work/sarabo"
 */
export function buildSitemap(siteUrl, paths) {
  const urls = paths
    .map((path) => {
      const loc = path === "/" ? siteUrl : `${siteUrl}${path}`;
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobots(siteUrl) {
  return `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

function main() {
  const siteUrl = resolveSiteUrl();
  const content = JSON.parse(readFileSync(CONTENT_FILE, "utf8"));
  const paths = getPublicRoutes(content).map((route) => route.path);
  writeFileSync(SITEMAP_FILE, buildSitemap(siteUrl, paths));
  writeFileSync(ROBOTS_FILE, buildRobots(siteUrl));
  console.log(
    `[seo] wrote sitemap.xml (${paths.length} routes) and robots.txt (base ${siteUrl})`,
  );
}

// Only run when invoked directly, so tests can import buildSitemap cleanly.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
