/**
 * Site settings: ids and defaults. Plain data with no Zod, because the
 * public site imports it (the schema in content.js would pull Zod into
 * the visitor's bundle). The defaults reproduce the site as it was before
 * settings existed, so a database without a settings document looks
 * exactly the same.
 */

// Mirrors client/src/features/preferences/appearance-options.js.
export const ACCENT_IDS = ["violet", "sky", "lime", "amber", "rose"];
export const FONT_IDS = ["geist", "inter", "grotesk", "system"];
export const THEME_IDS = ["system", "light", "dark"];
export const INTRO_STYLES = ["torn", "split"];

/** Resume-tab blocks on the profile, in their default order. */
export const PROFILE_SECTIONS = [
  { id: "about", label: "About" },
  { id: "open-to", label: "Open to" },
  { id: "experience", label: "Experience & leadership" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Licenses & certifications" },
  { id: "skills", label: "Skills" },
  { id: "resume", label: "Resume" },
];

/** Pages that can be renamed or hidden in navigation (Profile can't). */
export const NAV_ITEMS = [
  { id: "work", path: "/work", label: "Projects" },
  { id: "beyond", path: "/beyond", label: "Beyond" },
  { id: "contact", path: "/contact", label: "Contact" },
  { id: "credentials", path: "/credentials", label: "Credentials" },
  { id: "learning", path: "/learning", label: "Learning" },
  { id: "writing", path: "/writing", label: "Writing" },
  { id: "resume", path: "/resume", label: "Resume" },
];

export const DEFAULT_SETTINGS = {
  appearance: { theme: "system", accent: "lime", font: "geist" },
  intro: { enabled: true, sound: true, style: "torn" },
  profileSections: PROFILE_SECTIONS.map(({ id }) => ({ id, visible: true })),
  showGithubActivity: true,
  navigation: Object.fromEntries(
    NAV_ITEMS.map(({ id, label }) => [id, { label, visible: true }]),
  ),
  // Live before settings existed (CLAUDE.md: availability claims are
  // Jahid's call), so it stays on until he turns it off.
  openToWorkBadge: true,
  seo: {},
};

/**
 * Stored settings with defaults filled in, so documents saved before a
 * setting existed still work. Profile sections missing from a stored list
 * are appended (visible); unknown ones are dropped.
 * @param {Record<string, any> | null | undefined} stored
 */
export function withDefaultSettings(stored) {
  if (!stored) return structuredClone(DEFAULT_SETTINGS);
  const known = new Set(PROFILE_SECTIONS.map(({ id }) => id));
  const sections = (stored.profileSections ?? []).filter((item) =>
    known.has(item.id),
  );
  for (const { id } of PROFILE_SECTIONS) {
    if (!sections.some((item) => item.id === id)) {
      sections.push({ id, visible: true });
    }
  }
  return {
    ...structuredClone(DEFAULT_SETTINGS),
    ...stored,
    appearance: { ...DEFAULT_SETTINGS.appearance, ...stored.appearance },
    intro: { ...DEFAULT_SETTINGS.intro, ...stored.intro },
    profileSections: sections,
    navigation: Object.fromEntries(
      NAV_ITEMS.map(({ id }) => [
        id,
        { ...DEFAULT_SETTINGS.navigation[id], ...stored.navigation?.[id] },
      ]),
    ),
    seo: { ...stored.seo },
  };
}
