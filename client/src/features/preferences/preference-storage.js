import {
  ACCENT_OPTIONS,
  FONT_OPTIONS,
  isKnownOption,
} from "./appearance-options";
import { siteSettings } from "../../data/settings";

// Site settings choose the defaults; a visitor's own pick always wins.
const SITE_DEFAULTS = siteSettings.appearance;

/**
 * Safe localStorage access for per-visitor preferences. Storage can be
 * unavailable (private mode, blocked site data), so every access is
 * wrapped and falls back to the default instead of throwing.
 */

export const THEME_STORAGE_KEY = "theme";
export const SOUND_STORAGE_KEY = "sound";
export const ACCENT_STORAGE_KEY = "accent";
export const FONT_STORAGE_KEY = "font";

/** @param {string} key */
export function readPreference(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {string} value
 */
export function writePreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference simply won't persist; the in-memory state still applies.
  }
}

/** @returns {"light" | "dark"} */
export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** True when, with no choice of the visitor's own, the OS decides. */
export function followsSystemTheme() {
  return SITE_DEFAULTS.theme === "system";
}

/**
 * Stored choice wins; then the site default, which may be "follow the OS".
 * Mirrors the inline script in client/index.html — keep the two in sync.
 * @returns {"light" | "dark"}
 */
export function getInitialTheme() {
  const stored = readPreference(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return followsSystemTheme() ? getSystemTheme() : SITE_DEFAULTS.theme;
}

/** Sound is on by default; only an explicit "off" mutes it. */
export function getInitialSoundEnabled() {
  return readPreference(SOUND_STORAGE_KEY) !== "off";
}

/** Mirrors the inline script in client/index.html. */
export function getInitialAccent() {
  const stored = readPreference(ACCENT_STORAGE_KEY);
  return isKnownOption(ACCENT_OPTIONS, stored) ? stored : SITE_DEFAULTS.accent;
}

/** Mirrors the inline script in client/index.html. */
export function getInitialFont() {
  const stored = readPreference(FONT_STORAGE_KEY);
  return isKnownOption(FONT_OPTIONS, stored) ? stored : SITE_DEFAULTS.font;
}
