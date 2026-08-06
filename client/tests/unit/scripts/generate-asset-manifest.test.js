import { describe, expect, it } from "vitest";
import { buildManifest } from "../../../scripts/generate-asset-manifest.js";

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
});
