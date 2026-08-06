import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildManifest } from "../../../scripts/generate-asset-manifest.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BEYOND_PHOTOGRAPHY_DIR = join(
  __dirname,
  "..",
  "..",
  "..",
  "public",
  "assets",
  "beyond",
  "photography",
);

describe("generate-asset-manifest", () => {
  it("detects an available image", () => {
    const manifest = buildManifest();
    expect(manifest.profile.portrait.available).toBe(true);
    expect(manifest.profile.portrait.src).toBe(
      "/assets/profile/profile-portrait.webp",
    );
  });

  it("gives a missing image the expected placeholder fallback", () => {
    const manifest = buildManifest();
    expect(manifest.projects.bangLearner.cover.available).toBe(false);
    expect(manifest.projects.bangLearner.cover.src).toBeNull();
    expect(manifest.projects.bangLearner.cover.fallback).toBe(
      "/assets/placeholders/project-cover-placeholder.svg",
    );
  });

  it("returns gallery files in deterministic sorted order", () => {
    const manifest = buildManifest();
    const files = manifest.projects.sarabo.gallery.map((image) => image.file);
    expect(files).toEqual([
      "screenshot-01.webp",
      "screenshot-02.webp",
      "screenshot-03.webp",
      "screenshot-04.webp",
      "screenshot-05.webp",
      "screenshot-06.webp",
      "screenshot-07.webp",
      "screenshot-08.webp",
    ]);
    expect(files).toEqual([...files].sort());
  });

  it("reports Beyond photography as unavailable when no images exist", () => {
    const manifest = buildManifest();
    expect(manifest.beyond.photography.available).toBe(false);
    expect(manifest.beyond.photography.total).toBe(0);
  });

  it("lists Beyond photography categories in a fixed, deterministic order", () => {
    const manifest = buildManifest();
    expect(Object.keys(manifest.beyond.photography.categories)).toEqual([
      "street",
      "nature",
      "campus",
      "sports",
      "events",
      "uncategorized",
    ]);
  });

  it("returns empty arrays for Beyond leadership, volunteering, and highlights when no files exist", () => {
    const manifest = buildManifest();
    expect(manifest.beyond.leadership).toEqual([]);
    expect(manifest.beyond.volunteering).toEqual([]);
    expect(manifest.beyond.highlights).toEqual([]);
  });

  it("detects a newly added photograph and ignores unsupported file types in the same category", () => {
    const streetDir = join(BEYOND_PHOTOGRAPHY_DIR, "street");
    const imageFile = join(streetDir, "test-fixture.webp");
    const unsupportedFile = join(streetDir, "test-fixture.txt");

    mkdirSync(streetDir, { recursive: true });
    writeFileSync(imageFile, "");
    writeFileSync(unsupportedFile, "not an image");

    try {
      const manifest = buildManifest();
      const files = manifest.beyond.photography.categories.street.map(
        (image) => image.file,
      );
      expect(files).toContain("test-fixture.webp");
      expect(files).not.toContain("test-fixture.txt");
    } finally {
      unlinkSync(imageFile);
      unlinkSync(unsupportedFile);
    }
  });

  it("falls back unrecognized photographs to the uncategorized category", () => {
    const uncategorizedDir = join(BEYOND_PHOTOGRAPHY_DIR, "uncategorized");
    const imageFile = join(uncategorizedDir, "test-fixture.webp");

    mkdirSync(uncategorizedDir, { recursive: true });
    writeFileSync(imageFile, "");

    try {
      const manifest = buildManifest();
      const files = manifest.beyond.photography.categories.uncategorized.map(
        (image) => image.file,
      );
      expect(files).toContain("test-fixture.webp");
    } finally {
      unlinkSync(imageFile);
    }
  });
});
