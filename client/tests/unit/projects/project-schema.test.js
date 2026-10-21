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

  it("flags a complete case study with no sections", () => {
    const errors = validateProjects([
      validProject({
        caseStudyStatus: "complete",
        caseStudy: { sections: [] },
      }),
    ]);
    expect(
      errors.some((error) => error.includes("need at least one written")),
    ).toBe(true);
  });

  it("allows blank template sections next to a written one", () => {
    const errors = validateProjects([
      validProject({
        caseStudyStatus: "complete",
        caseStudy: {
          sections: [
            { id: "problem", heading: "Problem", type: "text", body: "A" },
            { id: "hard-part", heading: "The hard part", type: "text" },
          ],
        },
      }),
    ]);
    expect(errors).toEqual([]);
  });

  it("flags a complete case study whose sections are all blank", () => {
    const errors = validateProjects([
      validProject({
        caseStudyStatus: "complete",
        caseStudy: {
          sections: [{ id: "overview", heading: "Overview", type: "text" }],
        },
      }),
    ]);
    expect(
      errors.some((error) => error.includes("need at least one written")),
    ).toBe(true);
  });

  it("flags duplicate case-study section ids", () => {
    const errors = validateProjects([
      validProject({
        caseStudyStatus: "complete",
        caseStudy: {
          sections: [
            { id: "overview", heading: "Overview", type: "text", body: "A" },
            { id: "overview", heading: "Again", type: "text", body: "B" },
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
