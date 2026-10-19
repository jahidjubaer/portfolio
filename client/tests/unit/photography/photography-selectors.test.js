import { describe, expect, it } from "vitest";
import {
  getAvailableCategories,
  getPhotographsByCategory,
  hasSelectableCategories,
} from "../../../src/features/photography/photography-selectors";
import { buildPhotographs } from "../../../src/data/photography";

const fixture = [
  { id: "a", src: "/a.webp", title: "A", category: "Street", alt: "A" },
  { id: "b", src: "/b.webp", title: "B", category: "Nature", alt: "B" },
  { id: "c", src: "/c.webp", title: null, category: "Street", alt: "C" },
];

describe("photography-selectors", () => {
  it("lists albums in the order their first photo appears", () => {
    expect(getAvailableCategories(fixture)).toEqual(["Street", "Nature"]);
  });

  it("filters photographs by album", () => {
    expect(getPhotographsByCategory("Street", fixture)).toHaveLength(2);
    expect(getPhotographsByCategory("all", fixture)).toHaveLength(3);
    expect(getPhotographsByCategory(null, fixture)).toHaveLength(3);
    expect(getPhotographsByCategory("Sports", fixture)).toEqual([]);
  });

  it("only enables album selection with two or more albums present", () => {
    expect(hasSelectableCategories(fixture)).toBe(true);
    expect(hasSelectableCategories([fixture[0]])).toBe(false);
    expect(hasSelectableCategories([])).toBe(false);
  });
});

describe("buildPhotographs", () => {
  it("maps stored photos to gallery items in the admin's order", () => {
    const image = (name) => ({
      url: `https://store.public.blob.vercel-storage.com/photos/${name}.jpg`,
      width: 1600,
      height: 900,
    });
    expect(
      buildPhotographs([
        {
          id: "two",
          order: 1,
          image: image("two"),
          alt: "Two",
          album: "Nature",
        },
        {
          id: "one",
          order: 0,
          image: image("one"),
          alt: "A boat at dusk",
          caption: "Jadukata River",
          album: "Photography",
        },
      ]),
    ).toEqual([
      {
        id: "one",
        src: image("one").url,
        width: 1600,
        height: 900,
        title: "Jadukata River",
        category: "Photography",
        alt: "A boat at dusk",
      },
      {
        id: "two",
        src: image("two").url,
        width: 1600,
        height: 900,
        title: null,
        category: "Nature",
        alt: "Two",
      },
    ]);
  });
});
