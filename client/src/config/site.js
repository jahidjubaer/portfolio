/**
 * Verified site-wide identity used for SEO metadata and structured data.
 * Every value here must be real — no invented production domain, no
 * unverified claims. The public URL comes from VITE_SITE_URL and falls
 * back to the local dev origin so nothing ever hardcodes a domain that
 * does not exist yet.
 */

const rawSiteUrl = import.meta.env.VITE_SITE_URL || "http://localhost:5173";

// Normalise: no trailing slash, so `${url}${path}` never doubles up.
export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const siteConfig = {
  url: SITE_URL,
  name: "Jahid Hasan",
  shortName: "Jahid Hasan",
  title: "Jahid Hasan — Frontend Developer & Junior Software Engineer",
  description:
    "Portfolio of Jahid Hasan, a CSE graduate and React-focused frontend developer building modern web products and expanding into full-stack and AI-enabled engineering.",
  jobTitle: "Frontend Developer & Junior Software Engineer",
  locale: "en_US",
  twitterCard: "summary_large_image",
  defaultOgImage: "/assets/og/og-default.svg",
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
