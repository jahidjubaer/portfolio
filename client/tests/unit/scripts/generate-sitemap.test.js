import { describe, it, expect } from "vitest";
import {
  buildSitemap,
  buildRobots,
} from "../../../scripts/generate-sitemap.js";
import { getPublicRoutes } from "../../../src/routes/route-meta.js";

const content = {
  profile: { resume: { url: "/assets/resume/resume.pdf" } },
  projects: ["sarabo", "ict-crack"].map((slug) => ({
    slug,
    seo: { title: slug, description: slug },
  })),
};

describe("buildSitemap", () => {
  const xml = buildSitemap(
    "https://example.com",
    getPublicRoutes(content).map((route) => route.path),
  );

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
      "/credentials",
      "/learning",
      "/writing",
      "/beyond",
      "/contact",
      "/resume",
    ]) {
      expect(xml).toContain(`<loc>https://example.com${path}</loc>`);
    }
    expect(xml).toContain("<loc>https://example.com/work/sarabo</loc>");
    expect(xml).toContain("<loc>https://example.com/work/ict-crack</loc>");
  });

  it("never lists error or not-found routes", () => {
    expect(xml).not.toContain("/404");
    expect(xml).not.toContain("not-found");
  });

  it("does not list /blog — it is only a client-side redirect alias to /writing", () => {
    expect(xml).not.toContain("<loc>https://example.com/blog</loc>");
  });
});

describe("buildRobots", () => {
  it("allows all crawlers and points at the absolute sitemap URL", () => {
    const robots = buildRobots("https://example.com");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
  });
});
