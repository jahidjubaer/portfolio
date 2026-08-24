import { describe, it, expect } from "vitest";
import {
  buildSitemap,
  buildRobots,
  absolutizeOgImage,
} from "../../../scripts/generate-sitemap.js";

describe("buildSitemap", () => {
  const xml = buildSitemap("https://example.com", ["sarabo", "bang-learner"]);

  it("is well-formed sitemap XML", () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml.trim().endsWith("</urlset>")).toBe(true);
  });

  it("emits the home route as the bare origin (no trailing slash)", () => {
    expect(xml).toContain("<loc>https://example.com</loc>");
  });

  it("includes every static route and derived project route", () => {
    for (const path of [
      "/work",
      "/about",
      "/learning",
      "/beyond",
      "/contact",
      "/resume",
    ]) {
      expect(xml).toContain(`<loc>https://example.com${path}</loc>`);
    }
    expect(xml).toContain("<loc>https://example.com/work/sarabo</loc>");
    expect(xml).toContain("<loc>https://example.com/work/bang-learner</loc>");
  });

  it("never lists error or not-found routes", () => {
    expect(xml).not.toContain("/404");
    expect(xml).not.toContain("not-found");
  });

  it("does not list /blog — it is only a client-side redirect alias to /learning", () => {
    expect(xml).not.toContain("<loc>https://example.com/blog</loc>");
  });
});

describe("buildRobots", () => {
  it("allows all crawlers and points at the absolute sitemap URL", () => {
    const robots = buildRobots("https://example.com");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
  });
});

describe("absolutizeOgImage", () => {
  const relativeHtml = `
    <meta property="og:image" content="/assets/og/og-default.svg" />
    <meta name="twitter:image" content="/assets/og/og-default.svg" />
  `;

  it("makes both og:image and twitter:image absolute under the given site URL", () => {
    const updated = absolutizeOgImage(relativeHtml, "https://example.com");
    expect(updated).toContain(
      '<meta property="og:image" content="https://example.com/assets/og/og-default.svg" />',
    );
    expect(updated).toContain(
      '<meta name="twitter:image" content="https://example.com/assets/og/og-default.svg" />',
    );
  });

  it("is idempotent — re-running against an already-absolute value re-resolves cleanly", () => {
    const firstPass = absolutizeOgImage(relativeHtml, "https://example.com");
    const secondPass = absolutizeOgImage(
      firstPass,
      "https://staging.example.com",
    );
    expect(secondPass).toContain(
      '<meta property="og:image" content="https://staging.example.com/assets/og/og-default.svg" />',
    );
    expect(secondPass).not.toContain("https://example.com/assets");
  });

  it("matches Prettier's multi-line attribute formatting, not just a single line", () => {
    // Prettier wraps a long <meta ...> tag onto separate attribute lines —
    // the matcher must tolerate that, not assume everything is on one line.
    const multiLineHtml = `
    <meta
      property="og:image"
      content="/assets/og/og-default.svg"
    />
    <meta
      name="twitter:image"
      content="/assets/og/og-default.svg"
    />
  `;
    const updated = absolutizeOgImage(multiLineHtml, "https://example.com");
    expect(updated).toContain(
      'content="https://example.com/assets/og/og-default.svg"',
    );
    expect(updated).not.toContain('content="/assets/og/og-default.svg"');
  });

  it("does not touch unrelated tags", () => {
    const html = `<meta name="theme-color" content="/should-stay.svg" />${relativeHtml}`;
    const updated = absolutizeOgImage(html, "https://example.com");
    expect(updated).toContain(
      '<meta name="theme-color" content="/should-stay.svg" />',
    );
  });
});
