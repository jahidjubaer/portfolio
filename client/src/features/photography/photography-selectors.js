import { assetManifest } from "../../generated/asset-manifest";
import {
  PHOTOGRAPHY_CATEGORY_LABELS,
  photographs as defaultPhotographs,
} from "../../data/photography";

/**
 * Pure helpers over the photography data set. Every selector accepts an
 * optional list/manifest so tests can pass fixture data instead of the
 * real, imported asset manifest — the same pattern as
 * client/src/features/projects/project-selectors.js.
 */

const CATEGORY_ORDER = Object.keys(PHOTOGRAPHY_CATEGORY_LABELS);

export function getAllPhotographs(list = defaultPhotographs) {
  return list;
}

/**
 * Categories actually present in `list`, in the fixed display order
 * (see PHOTOGRAPHY_CATEGORY_LABELS) first, not alphabetical. Blogger
 * photography categories are open-ended (whatever label Jahid used on the
 * post) rather than the fixed local-asset enum, so any category present in
 * the data but not in that fixed list is appended afterward, sorted
 * alphabetically, instead of being silently dropped from the filter.
 */
export function getAvailableCategories(list = defaultPhotographs) {
  const present = new Set(list.map((photo) => photo.category));
  const known = CATEGORY_ORDER.filter((category) => present.has(category));
  const unknown = Array.from(present)
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort((a, b) => a.localeCompare(b));
  return [...known, ...unknown];
}

export function getPhotographsByCategory(category, list = defaultPhotographs) {
  if (!category || category === "all") return list;
  return list.filter((photo) => photo.category === category);
}

/**
 * Filters should only render when there's actually something to filter
 * between — a single category (or none) means the UI shows everything.
 */
export function hasSelectableCategories(list = defaultPhotographs) {
  return getAvailableCategories(list).length >= 2;
}

/**
 * Picks the single image the homepage Beyond preview may show, preferring
 * a curated "highlight" over an arbitrary first photograph. Returns null
 * when nothing is available, so callers can fall back to an abstract
 * preview instead of rendering a broken image.
 * @param {typeof assetManifest} manifest
 * @returns {{ file: string, src: string } | null}
 */
export function getBeyondPreviewImage(manifest = assetManifest) {
  const highlight = manifest.beyond?.highlights?.[0];
  if (highlight) return highlight;

  const categories = manifest.beyond?.photography?.categories ?? {};
  for (const category of CATEGORY_ORDER) {
    const files = categories[category];
    if (files && files.length > 0) return files[0];
  }
  return null;
}
