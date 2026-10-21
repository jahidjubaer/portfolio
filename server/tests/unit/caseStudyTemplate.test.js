import { describe, expect, it } from "vitest";
import {
  migrateProject,
  SARABO_SECTIONS,
} from "../../scripts/case-study-template-data.js";
import { projectSchema } from "../../src/schemas/content.js";
import { CASE_STUDY_TEMPLATE } from "../../src/schemas/case-study-template.js";

const base = {
  slug: "demo",
  order: 0,
  title: "Demo",
  summary: "A demo.",
  projectType: "Web app",
  status: "live",
  featured: false,
  stack: [],
  capabilities: [],
  links: [],
  caseStudyStatus: "complete",
  relatedSlugs: [],
  seo: { title: "Demo", description: "A demo." },
  missingContent: [],
};

describe("case study template migration", () => {
  it("drops gallery sections and captions", () => {
    const next = migrateProject({
      ...base,
      caseStudy: {
        sections: [
          { id: "overview", heading: "Overview", type: "text", body: "Hi" },
          { id: "gallery", heading: "Gallery", type: "gallery" },
        ],
        gallery: [{ file: "a.webp", caption: "A" }],
      },
    });
    expect(next.caseStudy.sections.map((s) => s.id)).toEqual(["overview"]);
    expect(next.caseStudy).not.toHaveProperty("gallery");
  });

  it("moves Sarabo into the template once, keeping its diagram", () => {
    const architecture = {
      nodes: [
        { id: "client", label: "Client", column: 1, row: 1 },
        { id: "api", label: "API", column: 2, row: 1 },
      ],
      steps: [{ from: "client", to: "api", label: "calls" }],
    };
    const sarabo = {
      ...base,
      slug: "sarabo",
      caseStudy: {
        sections: [
          { id: "overview", heading: "Overview", type: "text", body: "Old" },
        ],
        architecture,
      },
    };
    const next = migrateProject(sarabo);
    expect(next.caseStudy.sections).toBe(SARABO_SECTIONS);
    expect(next.caseStudy.sections.map((s) => s.id)).toEqual(
      CASE_STUDY_TEMPLATE.map((s) => s.id),
    );
    expect(next.caseStudy.architecture).toBe(architecture);
    expect(projectSchema.safeParse(next).success).toBe(true);
    expect(migrateProject(next)).toBeNull();
  });

  it("leaves projects without a case study alone", () => {
    expect(migrateProject({ ...base, caseStudy: null })).toBeNull();
  });
});

describe("project schema", () => {
  it("needs a description with a cover", () => {
    const cover = {
      url: "https://x.public.blob.vercel-storage.com/a.webp",
      width: 1600,
      height: 900,
    };
    const project = {
      ...base,
      caseStudy: {
        sections: [{ id: "p", heading: "P", type: "text", body: "Text" }],
      },
      cover,
    };
    expect(projectSchema.safeParse(project).success).toBe(false);
    expect(
      projectSchema.safeParse({ ...project, coverAlt: "The dashboard" })
        .success,
    ).toBe(true);
  });

  it("keeps blank sections but needs one written one when complete", () => {
    const blank = { id: "p", heading: "P", type: "text", body: "" };
    expect(
      projectSchema.safeParse({ ...base, caseStudy: { sections: [blank] } })
        .success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({
        ...base,
        caseStudyStatus: "none",
        caseStudy: { sections: [blank] },
      }).success,
    ).toBe(true);
  });
});
