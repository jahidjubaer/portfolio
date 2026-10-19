import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProjectCard } from "../../../src/features/projects/ProjectCard";
import { getProjectMonogram } from "../../../src/features/projects/project-selectors";

const project = {
  slug: "sarabo",
  title: "Sarabo",
  summary: "A multi-role electronics-repair service platform.",
  status: "live",
  caseStudyStatus: "complete",
  stack: ["React", "Node.js", "Express", "MongoDB", "Firebase"],
  links: [
    { label: "Live client", url: "https://sarabo-jahid.web.app", type: "live" },
    {
      label: "Client repository",
      url: "https://github.com/jahidjubaer/sarabo-client",
      type: "repository",
    },
  ],
};

function renderCard(overrides = {}) {
  render(
    <MemoryRouter>
      <ProjectCard project={{ ...project, ...overrides }} />
    </MemoryRouter>,
  );
}

describe("ProjectCard", () => {
  it("links its title to the project detail route", () => {
    renderCard();
    expect(screen.getByRole("link", { name: "Sarabo" })).toHaveAttribute(
      "href",
      "/work/sarabo",
    );
  });

  it("flags a complete case study", () => {
    renderCard();
    expect(screen.getByText("Full case study")).toBeInTheDocument();
  });

  it("flags a live project without a case study as Live", () => {
    renderCard({ caseStudyStatus: "in-preparation" });
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.queryByText("Full case study")).not.toBeInTheDocument();
  });

  it("shows at most four technology tags", () => {
    renderCard();
    const tags = screen.getByRole("list", { name: "Technologies" });
    expect(tags.children).toHaveLength(4);
  });

  it("links each public repository separately from the card link", () => {
    renderCard();
    expect(
      screen.getByRole("link", { name: "Sarabo client repository on GitHub" }),
    ).toHaveAttribute("href", "https://github.com/jahidjubaer/sarabo-client");
  });

  it("shows the live site and the repo's language and last update", () => {
    renderCard();
    expect(
      screen.getByRole("link", { name: "Sarabo live site" }),
    ).toHaveAttribute("href", "https://sarabo-jahid.web.app");
    expect(screen.getByText(/^JavaScript · Updated /)).toBeInTheDocument();
  });

  it("marks private projects and shows no repository link", () => {
    renderCard({ status: "private", links: [] });
    expect(screen.getByText("Private")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /on GitHub/ }),
    ).not.toBeInTheDocument();
  });

  it("shows a monogram tile when the project has no cover image", () => {
    renderCard({ slug: "bangladesh-landscape", title: "Bangladesh Landscape" });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("BL")).toBeInTheDocument();
  });
});

describe("getProjectMonogram", () => {
  it("keeps an all-caps first word and otherwise uses initials", () => {
    expect(getProjectMonogram("ICT Crack")).toBe("ICT");
    expect(getProjectMonogram("Bangladesh Landscape")).toBe("BL");
    expect(getProjectMonogram("Sarabo")).toBe("S");
  });
});
