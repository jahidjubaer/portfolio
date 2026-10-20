import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ArchitectureFlow } from "../../../src/features/projects/ArchitectureFlow";
import {
  firstAppearances,
  layoutArchitecture,
} from "../../../src/features/projects/architecture-layout";
import { validateProjects } from "../../../src/data/project-schema";

const ARCHITECTURE = {
  nodes: [
    { id: "client", label: "React client", column: 1, row: 2 },
    { id: "api", label: "Express API", column: 2, row: 2 },
    { id: "stripe", label: "Stripe", column: 2, row: 3 },
  ],
  steps: [
    { from: "client", to: "api", label: "Calls the API." },
    { from: "api", to: "stripe", label: "Creates a session." },
    { from: "stripe", to: "api", label: "Confirms by webhook." },
  ],
};

function mockMedia({ wide = false, reduced = false } = {}) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches:
      (query.includes("min-width") && wide) ||
      (query.includes("reduced-motion") && reduced),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("layoutArchitecture", () => {
  it("crops the diagram to the columns and rows in use", () => {
    const layout = layoutArchitecture(ARCHITECTURE);
    expect(layout.width).toBe(400);
    expect(layout.height).toBe(280);
    expect(layout.nodes[0]).toMatchObject({ x: 100, y: 70 });
  });

  it("curves two opposite steps apart and keeps single ones straight", () => {
    const [single, out, back] = layoutArchitecture(ARCHITECTURE).edges;
    const controlX = (edge) => Number(edge.path.split(" ")[4]);
    // client → api is horizontal: its control point stays on the line.
    expect(single.path.split(" ")[5]).toBe(single.path.split(" ")[2]);
    expect(controlX(out)).not.toBe(controlX(back));
  });

  it("is deterministic, so prerendered and hydrated markup match", () => {
    expect(layoutArchitecture(ARCHITECTURE)).toEqual(
      layoutArchitecture(ARCHITECTURE),
    );
  });

  it("knows when each part first appears", () => {
    const appearances = firstAppearances(ARCHITECTURE);
    expect(appearances.get("client")).toEqual({ step: 0, asSource: true });
    expect(appearances.get("api")).toEqual({ step: 0, asSource: false });
    expect(appearances.get("stripe")).toEqual({ step: 1, asSource: false });
  });
});

describe("ArchitectureFlow", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lists every step under the finished diagram on small screens", () => {
    mockMedia();
    render(<ArchitectureFlow architecture={ARCHITECTURE} />);
    const steps = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[2]).toHaveTextContent(
      "Stripe → Express API — Confirms by webhook.",
    );
  });

  it("keeps the static version under reduced motion, even on wide screens", () => {
    mockMedia({ wide: true, reduced: true });
    render(<ArchitectureFlow architecture={ARCHITECTURE} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("gives wide screens a step navigator that names every step", () => {
    mockMedia({ wide: true });
    render(<ArchitectureFlow architecture={ARCHITECTURE} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveAttribute("aria-current", "step");
    expect(buttons[1]).toHaveAccessibleName(
      "Step 2: Express API → Stripe: Creates a session.",
    );
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });
});

describe("diagram data validation", () => {
  function projectWith(caseStudy) {
    return {
      slug: "example",
      title: "Example",
      summary: "Summary.",
      projectType: "Web application",
      status: "live",
      featured: false,
      stack: [],
      capabilities: [],
      links: [],
      caseStudyStatus: "complete",
      caseStudy,
      relatedSlugs: [],
      seo: { title: "T", description: "D" },
      missingContent: [],
    };
  }
  const section = { id: "architecture", heading: "Architecture" };

  it("accepts a diagram section with its data", () => {
    const errors = validateProjects([
      projectWith({
        sections: [{ ...section, type: "diagram" }],
        architecture: ARCHITECTURE,
      }),
    ]);
    expect(errors).toEqual([]);
  });

  it("flags a diagram section without data, and a step to an unknown part", () => {
    expect(
      validateProjects([
        projectWith({ sections: [{ ...section, type: "diagram" }] }),
      ]),
    ).toEqual([
      expect.stringContaining("a diagram section needs caseStudy.architecture"),
    ]);
    expect(
      validateProjects([
        projectWith({
          sections: [{ ...section, type: "diagram" }],
          architecture: {
            ...ARCHITECTURE,
            steps: [{ from: "client", to: "db", label: "Stores." }],
          },
        }),
      ]),
    ).toEqual([expect.stringContaining("two different node ids")]);
  });
});
