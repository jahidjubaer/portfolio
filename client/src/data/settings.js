import { settings as storedSettings } from "../generated/content.json";
import {
  NAV_ITEMS,
  withDefaultSettings,
} from "../../../server/src/schemas/settings-defaults.js";

/**
 * Site settings from the admin (docs/09, P4), with defaults for anything
 * not saved yet. Plain data: the shared defaults module has no Zod, so
 * this adds nothing heavy to the visitor's bundle.
 */
export const siteSettings = withDefaultSettings(storedSettings);

/**
 * The menu label and visibility for a page, by its path. Pages with no
 * setting (Profile) are always shown under their own label.
 * @param {string} path
 * @param {string} fallbackLabel
 */
export function navSetting(path, fallbackLabel) {
  const item = NAV_ITEMS.find((entry) => entry.path === path);
  if (!item) return { label: fallbackLabel, visible: true };
  return siteSettings.navigation[item.id];
}
