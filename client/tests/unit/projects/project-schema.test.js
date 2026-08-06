import { describe, expect, it } from "vitest";
import { validateProjects } from "../../../src/data/project-schema";
import { projects as realProjects } from "../../../src/data/projects";

function validProject(overrides = {}) {
  return {
    slug: "example",
    title: "Example",
    summary: "An example project summary.",
    projectType: "Web application",
    status: "live",
    featured: false,
    stack: ["React"],
    capabilities: ["Authentication"],
    links: [
      {
        label: "Repository",
        url: "https://example.com/repo",
        type: "repository",
      },
    ],
    caseStudyStatus: "none",
    caseStudy: null,
    relatedSlugs: [],
    seo: { title: "Example — Jahid Hasan", description: "An example project." },
    missingContent: [],
    ...overrides,
  };
}

describe("validateProjects", () => {
  it("accepts the real project data set with zero errors", () => {
    expect(validateProjects(realProjects)).toEqual([]);
  });

  it("accepts a minimal valid project", () => {
    expect(validateProjects([validProject()])).toEqual([]);
  });

  it("flags duplicate slugs", () => {
    const errors = validateProjects([validProject(), validProject()]);
    expect(
      errors.some((error) => error.includes("Duplicate project slug")),
    ).toBe(true);
  });

  it("flags an invalid status value", () => {
    const errors = validateProjects([validProject({ status: "coming-soon" })]);
    expect(
      errors.some((error) => error.includes("status must be one of")),
    ).toBe(true);
  });

  it("flags an invalid link url", () => {
    const errors = validateProjects([
      validProject({
        links: [{ label: "Live", url: "not-a-url", type: "live" }],
      }),
    ]);
    expect(
      errors.some((error) => error.includes("url must be a valid URL")),
    ).toBe(true);
  });

  it("allows a null link url", () => {
    const errors = validateProjects([
      validProject({ links: [{ label: "Live", url: null, type: "live" }] }),
    ]);
    expect(errors).toEqual([]);
  });

  it("flags a missing required field on a complete case study", () => {
    const errors = validateProjects([
      validProject({
        caseStudyStatus: "complete",
        caseStudy: {
          overview: "Overview text.",
          roles: [],
          workflow: [{ label: "Step", description: "..." }],
          capabilities: ["A capability"],
          sections: [],
        },
      }),
    ]);
    expect(
      errors.some((error) =>
        error.includes("require a non-empty caseStudy.roles"),
      ),
    ).toBe(true);
  });

  it("flags duplicate case-study section ids", () => {
    const errors = validateProjects([
      validProject({
        caseStudyStatus: "complete",
        caseStudy: {
          overview: "Overview text.",
          roles: [{ name: "Customer", description: "..." }],
          workflow: [{ label: "Step", description: "..." }],
          capabilities: ["A capability"],
          sections: [
            { id: "overview", heading: "Overview" },
            { id: "overview", heading: "Overview again" },
          ],
        },
      }),
    ]);
    expect(errors.some((error) => error.includes("duplicate section id"))).toBe(
      true,
    );
  });

  it("flags a related-project slug that does not exist", () => {
    const errors = validateProjects([
      validProject({ relatedSlugs: ["does-not-exist"] }),
    ]);
    expect(
      errors.some((error) => error.includes('unknown slug "does-not-exist"')),
    ).toBe(true);
  });

  it("flags a featured project missing preview data", () => {
    const errors = validateProjects([
      validProject({ featured: true, stack: [] }),
    ]);
    expect(
      errors.some((error) => error.includes("featured projects require")),
    ).toBe(true);
  });
});
