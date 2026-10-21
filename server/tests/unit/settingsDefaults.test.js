import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  PROFILE_SECTIONS,
  withDefaultSettings,
} from "../../src/schemas/settings-defaults.js";
import { settingsSchema } from "../../src/schemas/content.js";

describe("site settings defaults", () => {
  it("are valid and keep the site as it was", () => {
    expect(settingsSchema.safeParse(DEFAULT_SETTINGS).success).toBe(true);
    expect(DEFAULT_SETTINGS.openToWorkBadge).toBe(true);
    expect(DEFAULT_SETTINGS.intro.enabled).toBe(true);
  });

  it("fill in what an older settings document lacks", () => {
    const merged = withDefaultSettings({
      appearance: { accent: "rose" },
      profileSections: [
        { id: "skills", visible: false },
        { id: "retired-section", visible: true },
      ],
      navigation: { beyond: { label: "Life", visible: true } },
    });
    expect(merged.appearance).toEqual({
      theme: "system",
      accent: "rose",
      font: "geist",
    });
    // Unknown ids dropped; missing sections go in at their default place.
    expect(merged.profileSections.map((item) => item.id)).toEqual(
      PROFILE_SECTIONS.map((item) => item.id),
    );
    expect(merged.profileSections[6]).toEqual({ id: "skills", visible: false });
    expect(merged.profileSections.map((item) => item.id)).not.toContain(
      "retired-section",
    );
    expect(merged.profileSections).toHaveLength(PROFILE_SECTIONS.length);
    expect(merged.navigation.beyond.label).toBe("Life");
    expect(merged.navigation.work.label).toBe("Projects");
    expect(settingsSchema.safeParse(merged).success).toBe(true);
  });

  it("slots sections added later next to their neighbours, keeping the saved order", () => {
    const saved = [
      "about",
      "open-to",
      "skills",
      "experience",
      "education",
      "certifications",
      "resume",
    ].map((id) => ({ id, visible: true }));
    const merged = withDefaultSettings({ profileSections: saved });
    expect(merged.profileSections.map((item) => item.id)).toEqual([
      "about",
      "open-to",
      "skills",
      "languages",
      "experience",
      "volunteering",
      "education",
      "certifications",
      "resume",
    ]);
  });
});
