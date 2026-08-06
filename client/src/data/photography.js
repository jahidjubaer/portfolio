import { assetManifest } from "../generated/asset-manifest";

/**
 * Verified photography categories — see CONTENT_CHECKLIST.md section 11.
 * No photograph currently has verified location, year, or caption
 * metadata, so those fields are intentionally omitted rather than
 * guessed. Order here also drives display order in the gallery/filter UI.
 */
export const PHOTOGRAPHY_CATEGORY_LABELS = {
  street: "Street",
  nature: "Nature",
  campus: "Campus",
  sports: "Sports",
  events: "Events",
  uncategorized: "Uncategorized",
};

function titleFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, "");
  const cleaned = base.replace(/[-_]+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function altForCategory(category) {
  const label = PHOTOGRAPHY_CATEGORY_LABELS[category];
  return label && category !== "uncategorized"
    ? `${label} photography by Jahid Hasan`
    : "Photography work by Jahid Hasan";
}

/**
 * Builds the flat photograph list the gallery renders from, sourced only
 * from files the asset manifest actually detected. Never invents a title,
 * location, year, or caption — a cleaned filename is used as a neutral
 * title fallback only.
 * @param {typeof assetManifest} manifest
 * @returns {Array<{ id: string, src: string, title: string | null, category: string, alt: string }>}
 */
export function buildPhotographs(manifest = assetManifest) {
  const categories = manifest.beyond?.photography?.categories ?? {};
  return Object.keys(categories).flatMap((category) =>
    categories[category].map((image, index) => ({
      id: `${category}-${index + 1}`,
      src: image.src,
      title: titleFromFilename(image.file),
      category,
      alt: altForCategory(category),
    })),
  );
}

export const photographs = buildPhotographs();
