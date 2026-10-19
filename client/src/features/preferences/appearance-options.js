/**
 * Accent colors and font families a visitor can pick. The CSS for each
 * lives in styles/accents.css and styles/typography.css (keyed by the
 * `data-accent` / `data-font` attribute on <html>). Lime sits in the
 * middle of the row and is the default.
 */

export const DEFAULT_ACCENT = "lime";
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
