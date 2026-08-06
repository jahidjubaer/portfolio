import { assetManifest } from "../generated/asset-manifest";

const SLUG_TO_MANIFEST_KEY = {
  sarabo: "sarabo",
  "bang-learner": "bangLearner",
  "note-bank": "noteBank",
};

/**
 * Resolves a project's manifest-tracked media (cover + gallery) by slug.
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
