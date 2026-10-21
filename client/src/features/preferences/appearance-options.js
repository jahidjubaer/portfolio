/**
 * Accent colors and font families a visitor can pick. The CSS for each
 * lives in styles/accents.css and styles/typography.css (keyed by the
 * `data-accent` / `data-font` attribute on <html>). Lime sits in the
 * middle of the row and is the default.
 */

export const DEFAULT_ACCENT = "lime";

/**
 * Full themes (docs/14 R7; colours in styles/scenes.css). Each sits on a
 * base light or dark theme. Graphite and Paper, the plain dark and light
 * themes, are no scene ("none"). `swatch`: canvas, surface, accent, text,
 * for the picker's little print. Mirrors SCENE_IDS in
 * server/src/schemas/settings-defaults.js.
 */
export const SCENE_OPTIONS = [
  {
    id: "darkroom",
    label: "Darkroom",
    base: "dark",
    swatch: ["#0a0606", "#211313", "#f26a59", "#f4e7e4"],
  },
  {
    id: "cyanotype",
    label: "Cyanotype",
    base: "dark",
    swatch: ["#0b2545", "#163a68", "#8fe3fb", "#f3f7fc"],
  },
  {
    id: "golden-hour",
    label: "Golden hour",
    base: "light",
    swatch: ["#fbf4e6", "#f2e3c6", "#f8953f", "#2a1a0c"],
  },
  {
    id: "night-shoot",
    label: "Night shoot",
    base: "dark",
    swatch: ["#05060a", "#161b26", "#3ee0c7", "#ff8cc6"],
  },
];

/**
 * The six seasons (docs/15), full themes like the scenes above, plus
 * `bangla` (the season's name) and `caption` (what it brings). Colours in
 * styles/scenes.css; when each starts in features/preferences/seasons.js.
 * Mirrors SCENE_IDS in server/src/schemas/settings-defaults.js.
 */
export const SEASON_OPTIONS = [
  {
    id: "grishma",
    label: "Summer",
    bangla: "গ্রীষ্ম",
    caption: "Storm clouds and ripe mangoes",
    base: "dark",
    swatch: ["#10131a", "#222a3b", "#ffc233", "#f3f1ea"],
  },
  {
    id: "barsha",
    label: "Monsoon",
    bangla: "বর্ষা",
    caption: "Rain on a tin roof",
    base: "dark",
    swatch: ["#08130f", "#162b23", "#6fd89a", "#e8f3ee"],
  },
  {
    id: "sharat",
    label: "Autumn",
    bangla: "শরৎ",
    caption: "Blue skies and kash flowers",
    base: "light",
    swatch: ["#eef6fd", "#d8e7f6", "#4aa6ee", "#0c2236"],
  },
  {
    id: "hemanta",
    label: "Late autumn",
    bangla: "হেমন্ত",
    caption: "The Aman harvest and Nabanna",
    base: "dark",
    swatch: ["#14110a", "#2c2417", "#e3b743", "#f6efdc"],
  },
  {
    id: "sheet",
    label: "Winter",
    bangla: "শীত",
    caption: "Morning fog over mustard fields",
    base: "light",
    swatch: ["#eef0ee", "#dbe0dc", "#eec41f", "#1a1f1c"],
  },
  {
    id: "basanta",
    label: "Spring",
    bangla: "বসন্ত",
    caption: "Shimul flowers and new leaves",
    base: "light",
    swatch: ["#fdf8f3", "#f3e3d8", "#f2604a", "#2a1410"],
  },
];

/** The scene choice that follows the calendar to today's season. */
export const SEASON_AUTO = "season";

/** The plain themes, shown first in the picker. */
export const PLAIN_THEMES = [
  {
    id: "dark",
    label: "Graphite",
    swatch: ["#09090b", "#1c1c21", "#a3e635", "#ededef"],
  },
  {
    id: "light",
    label: "Paper",
    swatch: ["#ffffff", "#f1f1f3", "#65a30d", "#141416"],
  },
];

/** A photographic scene or a season, by id. */
const ALL_SCENES = [...SCENE_OPTIONS, ...SEASON_OPTIONS];

/** @param {string | null | undefined} id */
export function sceneOption(id) {
  return ALL_SCENES.find((scene) => scene.id === id) ?? null;
}

/** @param {string | null | undefined} id */
export function seasonOption(id) {
  return SEASON_OPTIONS.find((season) => season.id === id) ?? null;
}

/**
 * A scene choice the visitor or Site settings can store: a scene, a
 * season, or "season" (follow the calendar).
 * @param {string | null | undefined} id
 */
export function isSceneChoice(id) {
  return id === SEASON_AUTO || sceneOption(id) !== null;
}
export const DEFAULT_FONT = "geist";

/** `swatch` is the fill color shown in the picker. */
export const ACCENT_OPTIONS = [
  { id: "violet", label: "Violet", swatch: "#a78bfa" },
  { id: "sky", label: "Sky", swatch: "#38bdf8" },
  { id: "lime", label: "Lime", swatch: "#a3e635" },
  { id: "amber", label: "Amber", swatch: "#fbbf24" },
  { id: "rose", label: "Rose", swatch: "#fb7185" },
];

/** `family` previews each option in its own typeface inside the picker. */
export const FONT_OPTIONS = [
  { id: "geist", label: "Geist", family: '"Geist Variable", sans-serif' },
  { id: "inter", label: "Inter", family: '"Inter Variable", sans-serif' },
  {
    id: "grotesk",
    label: "Space Grotesk",
    family: '"Space Grotesk Variable", sans-serif',
  },
  { id: "system", label: "System", family: "system-ui, sans-serif" },
];

/**
 * @param {Array<{ id: string }>} options
 * @param {string | null} value
 */
export function isKnownOption(options, value) {
  return options.some((option) => option.id === value);
}
