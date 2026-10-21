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

/** @param {string | null | undefined} id */
export function sceneOption(id) {
  return SCENE_OPTIONS.find((scene) => scene.id === id) ?? null;
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
