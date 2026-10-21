import { describe, expect, it } from "vitest";
import css from "../../src/styles/scenes.css?raw";
import {
  SCENE_OPTIONS,
  SEASON_OPTIONS,
} from "../../src/features/preferences/appearance-options";

// Every scene and season in styles/scenes.css keeps the site's contrast rules
// (docs/14 R7): text 4.5:1 on every surface, accent ink 4.5:1 on canvas
// and surfaces, text on accent fills 4.5:1.

function tokensOf(scene) {
  const start = css.indexOf(`:root[data-scene="${scene}"] {`);
  const block = css.slice(start, css.indexOf("\n}", start));
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const SURFACES = [
  "color-canvas",
  "color-canvas-subtle",
  "color-surface",
  "color-surface-raised",
  "color-surface-soft",
];
const TEXT = [
  "color-text-primary",
  "color-text-secondary",
  "color-text-muted",
  "color-accent-primary",
  "color-success",
  "color-warning",
  "color-danger",
];
const FILLS = [
  "color-accent-fill-from",
  "color-accent-fill",
  "color-accent-fill-to",
];

const SCENES = [...SCENE_OPTIONS, ...SEASON_OPTIONS].map((scene) => scene.id);

describe.each(SCENES)("scene %s", (scene) => {
  const tokens = tokensOf(scene);

  it("defines every colour it's checked on", () => {
    for (const name of [...SURFACES, ...TEXT, ...FILLS]) {
      expect(tokens[name], name).toMatch(/^#/);
    }
  });

  it("keeps text and accent ink at 4.5:1 on every surface", () => {
    for (const text of TEXT) {
      for (const surface of SURFACES) {
        expect(
          contrast(tokens[text], tokens[surface]),
          `${text} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps text on the accent fills at 4.5:1", () => {
    for (const fill of FILLS) {
      expect(
        contrast(tokens["color-on-accent-primary"], tokens[fill]),
        fill,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
