import { describe, expect, it } from "vitest";
import {
  OG_HEIGHT,
  OG_WIDTH,
  cardFor,
  ogImagePath,
  renderOgImage,
} from "../../../scripts/og-images.js";

// PNG: 8-byte signature, then the IHDR chunk with width and height.
function pngSize(png) {
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe("cardFor", () => {
  it("drops the name suffix the card already shows", () => {
    expect(
      cardFor({
        path: "/contact",
        title: "Contact — Jahid Hasan",
        description: "Get in touch.",
      }),
    ).toEqual({
      eyebrow: undefined,
      title: "Contact",
      description: "Get in touch.",
    });
  });

  it("labels case studies once, not twice", () => {
    expect(
      cardFor({
        path: "/work/sarabo",
        title: "Sarabo — Case study — Jahid Hasan",
        description: "How Sarabo works.",
      }),
    ).toMatchObject({ eyebrow: "Case study", title: "Sarabo" });
  });

  it("labels posts as writing", () => {
    expect(
      cardFor({
        path: "/writing/x",
        title: "জাভা স্ক্রিপ্ট — Jahid Hasan",
        description: "",
      }),
    ).toMatchObject({ eyebrow: "Writing", title: "জাভা স্ক্রিপ্ট" });
  });
});

describe("ogImagePath", () => {
  it("mirrors the page path under /og", () => {
    expect(ogImagePath("/work/sarabo")).toBe("/og/work/sarabo.png");
    expect(ogImagePath("/contact")).toBe("/og/contact.png");
  });
});

describe("renderOgImage", () => {
  it("renders a 1200 × 630 PNG, Bangla titles included", async () => {
    const png = await renderOgImage({
      eyebrow: "Writing",
      title: "জাভা স্ক্রিপ্ট পরিচিতি পর্ব - JavaScript",
      description: "আজকে আমারা শুরু করতে যাচ্ছি জাভা স্ক্রিপ্ট সিরিজ।",
      host: "example.com",
    });
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(pngSize(png)).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
  }, 20_000);
});
