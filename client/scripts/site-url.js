/**
 * Single source of truth for the site's public base URL at build time.
 * Resolution order:
 *   1. VITE_SITE_URL — explicit override (local .env or Vercel env var);
 *      becomes the canonical domain (https://jahid-hasan.com) once owned.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — provided automatically by Vercel
 *      builds (bare domain, no protocol), so production deployments get
 *      correct absolute OG/sitemap/canonical URLs with zero manual setup,
 *      and it tracks the primary domain if one is attached later.
 *   3. The local dev origin — never a made-up production domain.
 *
 * Used by scripts/generate-sitemap.js (prebuild) and vite.config.js
 * (which forwards the result to the client as import.meta.env.VITE_SITE_URL).
 */
export function resolveSiteUrl(env = process.env) {
  const raw =
    env.VITE_SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:5173");
  return raw.replace(/\/+$/, "");
}
