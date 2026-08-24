import { describe, expect, it } from "vitest";
import {
  getAllPhotographs,
  getAvailableCategories,
  getPhotographsByCategory,
  hasSelectableCategories,
  getBeyondPreviewImage,
} from "../../../src/features/photography/photography-selectors";

const fixture = [
  {
    id: "street-1",
    src: "/a.webp",
    title: "A",
    category: "street",
    alt: "Street photography by Jahid Hasan",
  },
  {
    id: "nature-1",
    src: "/b.webp",
    title: "B",
    category: "nature",
    alt: "Nature photography by Jahid Hasan",
  },
  {
    id: "nature-2",
    src: "/c.webp",
    title: null,
    category: "nature",
    alt: "Nature photography by Jahid Hasan",
  },
];

describe("photography-selectors", () => {
  it("returns all photographs", () => {
    expect(getAllPhotographs(fixture)).toEqual(fixture);
  });

  it("derives the list of available categories in fixed display order", () => {
    expect(getAvailableCategories(fixture)).toEqual(["street", "nature"]);
  });

  it("appends categories outside the fixed enum (e.g. Blogger labels) instead of dropping them", () => {
    const withBloggerCategories = [
      ...fixture,
      {
        id: "b-1",
        src: "/d.jpg",
        title: "D",
        category: "StreetPhotography",
        alt: "",
      },
      { id: "b-2", src: "/e.jpg", title: "E", category: "FEATURED", alt: "" },
    ];
    expect(getAvailableCategories(withBloggerCategories)).toEqual([
      "street",
      "nature",
      "FEATURED",
      "StreetPhotography",
    ]);
  });

  it("filters photographs by category", () => {
    expect(getPhotographsByCategory("nature", fixture)).toHaveLength(2);
    expect(getPhotographsByCategory("all", fixture)).toHaveLength(3);
    expect(getPhotographsByCategory(null, fixture)).toHaveLength(3);
  });

  it("returns an empty list for a category with no matches", () => {
    expect(getPhotographsByCategory("sports", fixture)).toEqual([]);
  });

  it("only enables category selection with two or more categories present", () => {
    expect(hasSelectableCategories(fixture)).toBe(true);
    expect(hasSelectableCategories([fixture[0]])).toBe(false);
    expect(hasSelectableCategories([])).toBe(false);
  });

  it("prefers a curated highlight image for the homepage preview", () => {
    const manifest = {
      beyond: {
        highlights: [
          { file: "hero.webp", src: "/assets/beyond/highlights/hero.webp" },
        ],
        photography: {
          categories: { street: [{ file: "s.webp", src: "/s.webp" }] },
        },
      },
    };
    expect(getBeyondPreviewImage(manifest)).toEqual({
      file: "hero.webp",
      src: "/assets/beyond/highlights/hero.webp",
    });
  });

  it("falls back to the first available photograph when there is no highlight", () => {
    const manifest = {
      beyond: {
        highlights: [],
        photography: {
          categories: {
            nature: [],
            street: [{ file: "s.webp", src: "/s.webp" }],
          },
        },
      },
    };
    expect(getBeyondPreviewImage(manifest)).toEqual({
      file: "s.webp",
      src: "/s.webp",
    });
  });

  it("returns null when no Beyond image exists at all", () => {
    const manifest = {
      beyond: { highlights: [], photography: { categories: {} } },
    };
    expect(getBeyondPreviewImage(manifest)).toBeNull();
  });
});
