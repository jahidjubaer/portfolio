import { photographs as defaultPhotographs } from "../../data/photography";

/**
 * Pure helpers over the photography data set. Every selector accepts an
 * optional list so tests can pass fixture data — the same pattern as
 * client/src/features/projects/project-selectors.js.
 */

/**
 * Albums present in `list`, in the order their first photo appears (the
 * admin's photo order), so the filter follows how Jahid arranged them.
 */
export function getAvailableCategories(list = defaultPhotographs) {
  return [...new Set(list.map((photo) => photo.category))];
}

export function getPhotographsByCategory(category, list = defaultPhotographs) {
  if (!category || category === "all") return list;
  return list.filter((photo) => photo.category === category);
}

/**
 * Filters should only render when there's actually something to filter
 * between — a single album (or none) means the UI shows everything.
 */
export function hasSelectableCategories(list = defaultPhotographs) {
  return getAvailableCategories(list).length >= 2;
}
