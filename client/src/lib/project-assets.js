import { assetManifest } from "../generated/asset-manifest";

const SLUG_TO_MANIFEST_KEY = {
  sarabo: "sarabo",
  "ict-crack": "ictCrack",
  "bangladesh-landscape": "bangladeshLandscape",
};

/**
 * Resolves a project's manifest-tracked media (cover + gallery) by slug.
 * Pages use `getProjectCover`, which prefers an uploaded cover.
 * Unknown slugs resolve to an empty, unavailable cover so callers can
 * render a placeholder without needing to guard for a missing entry.
 * @param {string} slug
 */
export function getProjectMedia(slug) {
  const key = SLUG_TO_MANIFEST_KEY[slug];
  const media = key ? assetManifest.projects[key] : null;
  return (
    media ?? {
      cover: {
        available: false,
        src: null,
        fallback: "/assets/placeholders/project-cover-placeholder.svg",
      },
      gallery: [],
    }
  );
}

/**
 * The one picture a project shows (card, case-study hero): the cover
 * uploaded in the admin, else the one in the repo's project folder.
 * @param {{ slug: string, title: string, cover?: { url: string, width: number, height: number, small?: { url: string, width: number } }, coverAlt?: string }} project
 * @returns {{ available: boolean, src: string | null, srcSet?: string, fallback: string, width?: number, height?: number, alt: string }}
 */
export function getProjectCover(project) {
  const alt = project.coverAlt || `${project.title} project cover`;
  const uploaded = project.cover;
  if (uploaded) {
    return {
      available: true,
      src: uploaded.url,
      srcSet: uploaded.small
        ? `${uploaded.small.url} ${uploaded.small.width}w, ${uploaded.url} ${uploaded.width}w`
        : undefined,
      fallback: "/assets/placeholders/project-cover-placeholder.svg",
      width: uploaded.width,
      height: uploaded.height,
      alt,
    };
  }
  return { ...getProjectMedia(project.slug).cover, alt };
}
