/**
 * Generates client/public/sitemap.xml from the canonical list of public,
 * indexable routes. Uses Node built-ins only (no XML library).
 *
 * The base URL comes from VITE_SITE_URL and falls back to the local dev
 * origin, so the sitemap never hardcodes a production domain that does not
 * exist yet. Project detail routes are derived from the slugs declared in
 * src/data/projects.js so this list can never silently drift from the data.
 *
 * Error/404 states are intentionally excluded — they are marked noindex at
 * runtime and must never appear in the sitemap.
 *
 * Regenerate via `npm run seo:generate` (also run automatically in prebuild).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = join(__dirname, "..");
const PROJECTS_FILE = join(CLIENT_ROOT, "src", "data", "projects.js");
const SITEMAP_FILE = join(CLIENT_ROOT, "public", "sitemap.xml");
const ROBOTS_FILE = join(CLIENT_ROOT, "public", "robots.txt");

const STATIC_ROUTES = [
  "/",
  "/work",
  "/about",
  "/beyond",
  "/contact",
  "/resume",
];

function resolveSiteUrl() {
  const raw = process.env.VITE_SITE_URL || "http://localhost:5173";
  return raw.replace(/\/+$/, "");
}

function readProjectSlugs() {
  const source = readFileSync(PROJECTS_FILE, "utf8");
  const slugs = [];
  const pattern = /slug:\s*["']([^"']+)["']/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
}

export function buildSitemap(siteUrl, slugs) {
  const paths = [...STATIC_ROUTES, ...slugs.map((slug) => `/work/${slug}`)];
  const urls = paths
    .map((path) => {
      const loc = path === "/" ? siteUrl : `${siteUrl}${path}`;
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobots(siteUrl) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

function main() {
  const siteUrl = resolveSiteUrl();
  const slugs = readProjectSlugs();
  writeFileSync(SITEMAP_FILE, buildSitemap(siteUrl, slugs));
  writeFileSync(ROBOTS_FILE, buildRobots(siteUrl));
  console.log(
    `[seo] wrote sitemap.xml (${STATIC_ROUTES.length + slugs.length} routes) and robots.txt (base ${siteUrl})`,
  );
}

// Only run when invoked directly, so tests can import buildSitemap cleanly.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
