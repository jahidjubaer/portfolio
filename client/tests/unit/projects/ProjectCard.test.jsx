import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectCard } from "../../../src/features/projects/ProjectCard";

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

describe("ProjectCard", () => {
  it("links its title to the project detail route", () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Sarabo" })).toHaveAttribute(
      "href",
      "/work/sarabo",
    );
  });

  it("shows a 'View case study' CTA for a complete case study", () => {
    render(
      <MemoryRouter>
        <ProjectCard project={project} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/View case study/)).toBeInTheDocument();
  });

  it("shows a 'View project' CTA for an in-preparation project", () => {
    render(
      <MemoryRouter>
        <ProjectCard
          project={{ ...project, caseStudyStatus: "in-preparation" }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/View project/)).toBeInTheDocument();
  });

  it("uses the project cover placeholder when a project has no cover image", () => {
    render(
      <MemoryRouter>
        <ProjectCard project={{ ...project, slug: "bang-learner" }} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/assets/placeholders/project-cover-placeholder.svg",
    );
  });
});
