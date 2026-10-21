import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  architectureSchema,
  caseStudySchema,
  projectSchema,
} from "../../src/schemas/content.js";
import {
  SARABO_ARCHITECTURE,
  withArchitecture,
} from "../../scripts/sarabo-architecture-data.js";

const snapshot = JSON.parse(
  readFileSync(
    new URL("../../../client/src/generated/content.json", import.meta.url),
    "utf8",
  ),
);

const TWO_PARTS = {
  nodes: [
    { id: "client", label: "Client", column: 1, row: 1 },
    { id: "api", label: "API", column: 2, row: 1 },
  ],
  steps: [{ from: "client", to: "api", label: "Calls it." }],
};

function messages(result) {
  return result.error.issues.map((issue) => issue.message);
}

describe("architectureSchema", () => {
  it("accepts parts on the grid and steps between them", () => {
    expect(architectureSchema.safeParse(TWO_PARTS).success).toBe(true);
  });

  it("rejects a step to a part that doesn't exist", () => {
    const result = architectureSchema.safeParse({
      ...TWO_PARTS,
      steps: [{ from: "client", to: "db", label: "Stores." }],
    });
    expect(messages(result)).toContain("Use the ID of one of the parts above.");
  });

  it("rejects a step from a part to itself", () => {
    const result = architectureSchema.safeParse({
      ...TWO_PARTS,
      steps: [{ from: "api", to: "api", label: "Loops." }],
    });
    expect(messages(result)).toContain("A step connects two different parts.");
  });

  it("rejects two parts in one cell, repeated ids, and off-grid positions", () => {
    const result = architectureSchema.safeParse({
      ...TWO_PARTS,
      nodes: [
        ...TWO_PARTS.nodes,
        { id: "api", label: "Again", column: 2, row: 1 },
        { id: "far", label: "Far", column: 4, row: 1 },
      ],
    });
    expect(messages(result)).toEqual(
      expect.arrayContaining([
        "Each part needs a different ID.",
        "Another part already uses this column and row.",
        "Enter 1, 2, or 3.",
      ]),
    );
  });
});

describe("diagram sections", () => {
  const section = { id: "architecture", heading: "Architecture" };

  it("may have no text", () => {
    const result = caseStudySchema.safeParse({
      sections: [{ ...section, type: "diagram" }],
      architecture: TWO_PARTS,
    });
    expect(result.success).toBe(true);
  });

  it("need the diagram data", () => {
    const result = caseStudySchema.safeParse({
      sections: [{ ...section, type: "diagram", body: "Intro." }],
    });
    expect(messages(result)).toContain(
      "A diagram section needs the architecture diagram's parts and steps.",
    );
  });
});

describe("Sarabo's architecture", () => {
  const sarabo = snapshot.projects.find((project) => project.slug === "sarabo");

  it("is a valid diagram", () => {
    expect(architectureSchema.safeParse(SARABO_ARCHITECTURE).success).toBe(
      true,
    );
  });

  it("turns the Architecture section into a diagram and keeps its text", () => {
    // Sarabo before docs/14 moved it into the case-study template.
    const before = {
      ...sarabo,
      caseStudy: {
        ...sarabo.caseStudy,
        architecture: undefined,
        sections: [
          {
            id: "architecture",
            heading: "Architecture",
            type: "text",
            body: "- **Express API** — handles repair requests.",
          },
        ],
      },
    };
    const { order, ...rest } = withArchitecture(before);
    const result = projectSchema.safeParse({ ...rest, order: order ?? 0 });
    expect(result.success).toBe(true);
    const architecture = result.data.caseStudy.sections.find(
      (entry) => entry.id === "architecture",
    );
    expect(architecture.type).toBe("diagram");
    expect(architecture.body).toContain("Express API");
  });
});
