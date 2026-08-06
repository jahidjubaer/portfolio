import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RelatedProjects } from "../../../src/features/projects/RelatedProjects";

const projects = [
  {
    slug: "bang-learner",
    title: "Bang Learner",
    summary: "A responsive skill-learning platform.",
    status: "repository-available",
    caseStudyStatus: "in-preparation",
    stack: ["React"],
    links: [],
  },
];

describe("RelatedProjects", () => {
  it("renders a card for each related project", () => {
    render(
      <MemoryRouter>
        <RelatedProjects projects={projects} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Bang Learner" })).toHaveAttribute(
      "href",
      "/work/bang-learner",
    );
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(
      <MemoryRouter>
        <RelatedProjects projects={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
