import { describe, expect, it } from "vitest";
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getRelatedProjects,
  hasCompleteCaseStudy,
  getProjectLinks,
} from "../../../src/features/projects/project-selectors";

const fixture = [
  {
    slug: "alpha",
    title: "Alpha",
    featured: true,
    caseStudyStatus: "complete",
    relatedSlugs: ["beta"],
    links: [
      { label: "Live", url: "https://alpha.example.com", type: "live" },
      {
        label: "Repository",
        url: "https://github.com/example/alpha",
        type: "repository",
      },
    ],
  },
  {
    slug: "beta",
    title: "Beta",
    featured: false,
    caseStudyStatus: "in-preparation",
    relatedSlugs: ["alpha"],
    links: [],
  },
];

describe("project selectors", () => {
  it("getAllProjects returns the full list", () => {
    expect(getAllProjects(fixture)).toHaveLength(2);
  });

  it("getFeaturedProjects filters by featured", () => {
    expect(getFeaturedProjects(fixture).map((p) => p.slug)).toEqual(["alpha"]);
  });

  it("getProjectBySlug finds a matching project", () => {
    expect(getProjectBySlug("beta", fixture)?.title).toBe("Beta");
  });

  it("getProjectBySlug returns null for an unknown slug", () => {
    expect(getProjectBySlug("unknown", fixture)).toBeNull();
  });

  it("getRelatedProjects resolves related slugs to full projects", () => {
    expect(getRelatedProjects("alpha", fixture).map((p) => p.slug)).toEqual([
      "beta",
    ]);
  });

  it("getRelatedProjects returns an empty array for an unknown slug", () => {
    expect(getRelatedProjects("unknown", fixture)).toEqual([]);
  });

  it("hasCompleteCaseStudy is true only for complete case studies", () => {
    expect(hasCompleteCaseStudy(fixture[0])).toBe(true);
    expect(hasCompleteCaseStudy(fixture[1])).toBe(false);
    expect(hasCompleteCaseStudy(null)).toBe(false);
  });

  it("getProjectLinks returns all links by default", () => {
    expect(getProjectLinks(fixture[0])).toHaveLength(2);
  });

  it("getProjectLinks filters by link type", () => {
    expect(getProjectLinks(fixture[0], "repository")).toHaveLength(1);
  });

  it("getProjectLinks returns an empty array for a project with no links", () => {
    expect(getProjectLinks(fixture[1])).toEqual([]);
  });
});
