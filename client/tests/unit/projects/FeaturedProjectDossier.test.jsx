import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FeaturedProjectDossier } from "../../../src/features/projects/FeaturedProjectDossier";

const project = {
  slug: "sarabo",
  title: "Sarabo",
  summary: "A multi-role electronics-repair service platform.",
  status: "live",
  caseStudyStatus: "complete",
  stack: ["React", "Node.js"],
  links: [
    { label: "Live client", url: "https://sarabo-jahid.web.app", type: "live" },
  ],
};

describe("FeaturedProjectDossier", () => {
  it("lazy-loads its cover image by default", () => {
    render(
      <MemoryRouter>
        <FeaturedProjectDossier project={project} index={1} />
      </MemoryRouter>,
    );
    const image = screen.getByRole("img", { name: "Sarabo project cover" });
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).not.toHaveAttribute("fetchpriority");
  });

  it("marks the cover image high-priority only when explicitly the route's LCP candidate", () => {
    render(
      <MemoryRouter>
        <FeaturedProjectDossier project={project} index={1} priorityImage />
      </MemoryRouter>,
    );
    const image = screen.getByRole("img", { name: "Sarabo project cover" });
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
  });
});
