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
    // Saved order first, unknown ids dropped, new sections appended.
    expect(merged.profileSections[0]).toEqual({ id: "skills", visible: false });
    expect(merged.profileSections.map((item) => item.id)).not.toContain(
      "retired-section",
    );
    expect(merged.profileSections).toHaveLength(PROFILE_SECTIONS.length);
    expect(merged.navigation.beyond.label).toBe("Life");
    expect(merged.navigation.work.label).toBe("Projects");
    expect(settingsSchema.safeParse(merged).success).toBe(true);
  });
});
