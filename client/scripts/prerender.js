/**
 * Post-build step (R7): writes a static HTML file for every public route,
 * each with its own <title>, description, canonical URL, Open Graph and
 * Twitter tags. Crawlers and link previews (LinkedIn, X, WhatsApp) read
 * the right metadata for /work/sarabo without running JavaScript; the
 * page body still renders in the browser as before.
 *
 *   dist/index.html       → "/"
 *   dist/work.html        → "/work"
 *   dist/work/sarabo.html → "/work/sarabo"
 *
 * Vercel serves "/work/sarabo" from work/sarabo.html (`cleanUrls` in
 * vercel.json; `vite preview` does the same). Any other path is rewritten to
 * dist/200.html (vercel.json), the same app with no canonical URL and
 * `noindex`, so an unknown URL never poses as the home page.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSiteUrl } from "./site-url.js";
import { PAGE_META, SITE, getPublicRoutes } from "../src/routes/route-meta.js";

const CLIENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(CLIENT_ROOT, "dist");
const CONTENT_FILE = join(CLIENT_ROOT, "src", "generated", "content.json");
const BLOCK = /<!-- route-meta -->[\s\S]*?<!-- \/route-meta -->/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * The head tags for one route: the same set (and selectors) usePageMeta
 * manages in the browser. A route without a `path` (the SPA fallback)
 * gets no canonical URL and its own `robots`.
 * @param {{ path?: string, title: string, description: string, type?: string, robots?: string }} route
 * @param {string} siteUrl
 */
export function renderHeadTags(route, siteUrl) {
  let url = null;
  if (route.path) {
    url = route.path === "/" ? siteUrl : `${siteUrl}${route.path}`;
  }
  const image = `${siteUrl}${SITE.defaultOgImage}`;
  const meta = (key, name, content) =>
    `<meta ${key}="${name}" content="${escapeHtml(content)}" />`;
  return [
    "<!-- route-meta -->",
    `<title>${escapeHtml(route.title)}</title>`,
    meta("name", "description", route.description),
    url ? `<link rel="canonical" href="${escapeHtml(url)}" />` : null,
    meta("name", "robots", route.robots ?? "index, follow"),
    meta("property", "og:type", route.type ?? "website"),
    meta("property", "og:site_name", SITE.name),
    meta("property", "og:locale", SITE.locale),
    meta("property", "og:title", route.title),
    meta("property", "og:description", route.description),
    url ? meta("property", "og:url", url) : null,
    meta("property", "og:image", image),
    meta("property", "og:image:width", "1200"),
    meta("property", "og:image:height", "630"),
    meta("name", "twitter:card", SITE.twitterCard),
    meta("name", "twitter:title", route.title),
    meta("name", "twitter:description", route.description),
    meta("name", "twitter:image", image),
    "<!-- /route-meta -->",
  ]
    .filter(Boolean)
    .join("\n    ");
}

/** @param {string} template built index.html */
export function renderRoute(template, route, siteUrl) {
  if (!BLOCK.test(template)) {
    throw new Error("index.html has no <!-- route-meta --> block.");
  }
  // A function replacement, so "$" in a title is never read as a pattern.
  return template.replace(BLOCK, () => renderHeadTags(route, siteUrl));
}

function outputFile(path) {
  if (path === "/") return join(DIST, "index.html");
  return `${join(DIST, ...path.slice(1).split("/"))}.html`;
}

function main() {
  const siteUrl = resolveSiteUrl();
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const content = JSON.parse(readFileSync(CONTENT_FILE, "utf8"));
  const routes = getPublicRoutes(content);
  for (const route of routes) {
    const file = outputFile(route.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, renderRoute(template, route, siteUrl));
  }
  writeFileSync(
    join(DIST, "200.html"),
    renderRoute(template, { ...PAGE_META["/"], robots: "noindex" }, siteUrl),
  );
  console.log(
    `[prerender] wrote ${routes.length} routes + 200.html fallback (base ${siteUrl})`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
