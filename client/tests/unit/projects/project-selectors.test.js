import { describe, expect, it } from "vitest";
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getRelatedProjects,
  hasCompleteCaseStudy,
  getProjectLinks,
  getProjectLiveUrl,
  getProjectRepo,
  getRepoName,
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

describe("GitHub selectors", () => {
  const snapshot = {
    username: "jahidjubaer",
    repos: {
      "app-client": {
        name: "app-client",
        language: "JavaScript",
        homepage: "https://app.example",
        pushedAt: "2026-10-01T00:00:00Z",
      },
      "app-server": {
        name: "app-server",
        language: "TypeScript",
        homepage: null,
        pushedAt: "2026-10-05T00:00:00Z",
      },
    },
  };
  const repoLink = (name) => ({
    label: name,
    url: `https://github.com/JahidJubaer/${name}`,
    type: "repository",
  });

  it("reads repo names only from the synced account", () => {
    expect(
      getRepoName("https://github.com/jahidjubaer/App.git", "jahidjubaer"),
    ).toBe("app");
    expect(getRepoName("https://github.com/other/app", "jahidjubaer")).toBe(
      null,
    );
    expect(getRepoName("https://example.com/a/b", "jahidjubaer")).toBe(null);
  });

  it("picks the most recently pushed linked repo", () => {
    const project = {
      links: [repoLink("app-client"), repoLink("app-server"), repoLink("gone")],
    };
    expect(getProjectRepo(project, snapshot).name).toBe("app-server");
    expect(getProjectRepo({ links: [repoLink("gone")] }, snapshot)).toBe(null);
  });

  it("prefers the project's live link over the repo homepage", () => {
    const fromRepo = { links: [repoLink("app-client")] };
    expect(getProjectLiveUrl(fromRepo, snapshot)).toBe("https://app.example");
    const own = {
      links: [
        { label: "Live", url: "https://own.example", type: "live" },
        repoLink("app-client"),
      ],
    };
    expect(getProjectLiveUrl(own, snapshot)).toBe("https://own.example");
    expect(getProjectLiveUrl({ links: [] }, snapshot)).toBe(null);
  });
});
