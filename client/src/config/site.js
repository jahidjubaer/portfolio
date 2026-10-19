/**
 * Verified site-wide identity used for SEO metadata and structured data.
 * Every value here must be real — no invented production domain, no
 * unverified claims. The public URL comes from VITE_SITE_URL and falls
 * back to the local dev origin so nothing ever hardcodes a domain that
 * does not exist yet.
 */

import { SITE, homeMeta, shareImage } from "../routes/route-meta";
import { siteSettings } from "../data/settings";

const home = homeMeta(siteSettings.seo);

const rawSiteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:5173";

// Normalise: no trailing slash, so `${url}${path}` never doubles up.
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const siteConfig = {
  ...SITE,
  url: SITE_URL,
  shortName: SITE.name,
  title: home.title,
  description: home.description,
  // Site settings can replace the built-in link-preview image.
  defaultOgImage: shareImage(siteSettings.seo).url,
  jobTitle: "Frontend Developer & Junior Software Engineer",
  // Verified public profiles only (mirrors client/src/data/profile.js).
  sameAs: [
    "https://github.com/jahidjubaer",
    "https://www.linkedin.com/in/jahidjubaer/",
    "https://codeforces.com/profile/jahidjubaer17",
    "https://leetcode.com/u/jahidjubaer/",
  ],
};

/**
 * Builds an absolute URL from a site-relative path. Crawlers need absolute
 * URLs for canonical/OG/Twitter tags.
 * @param {string} [path]
 */
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Collapse a bare "/" so the home canonical is the origin itself.
  return normalized === "/" ? siteConfig.url : `${siteConfig.url}${normalized}`;
}
