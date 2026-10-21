/**
 * Post-build step (R7): writes a static HTML file for every public route,
 * each with its own <title>, description, canonical URL, Open Graph and
 * Twitter tags, and the page itself rendered into <div id="root"> (by
 * the SSR bundle from src/entry-server.jsx). Crawlers and link previews
 * read the right metadata and content without running JavaScript, the
 * first paint shows the real page, and the browser hydrates it.
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveSiteUrl } from "./site-url.js";
import {
  OG_HEIGHT,
  OG_WIDTH,
  cardFor,
  ogImagePath,
  renderOgImage,
} from "./og-images.js";
import {
  SITE,
  getPublicRoutes,
  homeMeta,
  shareImage,
} from "../src/routes/route-meta.js";

const CLIENT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(CLIENT_ROOT, "dist");
const CONTENT_FILE = join(CLIENT_ROOT, "src", "generated", "content.json");
const BLOCK = /<!-- route-meta -->[\s\S]*?<!-- \/route-meta -->/;
const SERVER_ENTRY = join(CLIENT_ROOT, "dist-server", "entry-server.js");
const ROOT = '<div id="root"></div>';

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
 * `image` is the share image (Site settings, or the built-in default);
 * an uploaded one already has an absolute URL.
 * @param {{ path?: string, title: string, description: string, type?: string, robots?: string }} route
 * @param {string} siteUrl
 * @param {{ url: string, width: number, height: number }} [image]
 */
export function renderHeadTags(route, siteUrl, image = shareImage()) {
  let url = null;
  if (route.path) {
    url = route.path === "/" ? siteUrl : `${siteUrl}${route.path}`;
  }
  const imageUrl = /^https?:\/\//.test(image.url)
    ? image.url
    : `${siteUrl}${image.url}`;
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
    meta("property", "og:image", imageUrl),
    meta("property", "og:image:width", String(image.width)),
    meta("property", "og:image:height", String(image.height)),
    meta("name", "twitter:card", SITE.twitterCard),
    meta("name", "twitter:title", route.title),
    meta("name", "twitter:description", route.description),
    meta("name", "twitter:image", imageUrl),
    "<!-- /route-meta -->",
  ]
    .filter(Boolean)
    .join("\n    ");
}

/**
 * @param {string} template built index.html
 * @param {{ html: string, renderedAt: string }} [body] the prerendered page;
 *   without it the root stays empty and the page renders in the browser
 */
export function renderRoute(template, route, siteUrl, image, body) {
  if (!BLOCK.test(template)) {
    throw new Error("index.html has no <!-- route-meta --> block.");
  }
  // Function replacements, so "$" in a title or page is never a pattern.
  const withHead = template.replace(BLOCK, () =>
    renderHeadTags(route, siteUrl, image),
  );
  if (!body) return withHead;
  if (!withHead.includes(ROOT)) {
    throw new Error(`index.html has no ${ROOT}.`);
  }
  return withHead.replace(
    ROOT,
    () =>
      `<div id="root" data-rendered-at="${escapeHtml(body.renderedAt)}">${body.html}</div>`,
  );
}

/**
 * The page bodies, rendered by the SSR bundle. A route that fails to
 * render ships with an empty root (it still works, rendered in the
 * browser), and the build log says which one.
 */
async function loadRenderer() {
  if (!existsSync(SERVER_ENTRY)) {
    console.warn(
      "[prerender] no dist-server/entry-server.js; pages render in the browser only.",
    );
    return null;
  }
  const { renderPage } = await import(pathToFileURL(SERVER_ENTRY).href);
  return renderPage;
}

/**
 * Writes the page's link-preview card to dist/og/ and returns it as an
 * og:image. A card that fails to render leaves the page with the share
 * image (the build log says which), so a preview never breaks the build.
 * @returns {Promise<{ url: string, width: number, height: number } | null>}
 */
async function writeCard(route, siteUrl) {
  const url = ogImagePath(route.path);
  try {
    const png = await renderOgImage({
      ...cardFor(route),
      host: new URL(siteUrl).host,
    });
    const file = join(DIST, ...url.slice(1).split("/"));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, png);
    return { url, width: OG_WIDTH, height: OG_HEIGHT };
  } catch (error) {
    console.warn(
      `[prerender] ${route.path}: no preview card (${error.message})`,
    );
    return null;
  }
}

/**
 * A page's og:image: its own (a post cover), else its card. The home page
 * keeps the share image from Site settings (or the built-in default).
 */
async function imageFor(route, siteUrl, shared) {
  if (route.image) return route.image;
  if (route.path === "/") return shared;
  return (await writeCard(route, siteUrl)) ?? shared;
}

function outputFile(path) {
  if (path === "/") return join(DIST, "index.html");
  return `${join(DIST, ...path.slice(1).split("/"))}.html`;
}

async function main() {
  const siteUrl = resolveSiteUrl();
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const content = JSON.parse(readFileSync(CONTENT_FILE, "utf8"));
  const routes = getPublicRoutes(content);
  const seo = content.settings?.seo;
  const image = shareImage(seo);
  const renderPage = await loadRenderer();
  const now = new Date();
  let rendered = 0;
  let cards = 0;
  for (const route of routes) {
    const routeImage = await imageFor(route, siteUrl, image);
    if (routeImage.url.startsWith("/og/")) cards += 1;
    let body;
    if (renderPage) {
      try {
        body = {
          html: await renderPage(route.path, now),
          renderedAt: now.toISOString(),
        };
        rendered += 1;
      } catch (error) {
        console.warn(`[prerender] ${route.path}: ${error.message}`);
      }
    }
    const file = outputFile(route.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      renderRoute(template, route, siteUrl, routeImage, body),
    );
  }
  writeFileSync(
    join(DIST, "200.html"),
    renderRoute(
      template,
      { ...homeMeta(seo), robots: "noindex" },
      siteUrl,
      image,
    ),
  );
  console.log(
    `[prerender] wrote ${routes.length} routes (${rendered} with the page rendered, ${cards} preview cards) + 200.html fallback (base ${siteUrl})`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
