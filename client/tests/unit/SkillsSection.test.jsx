import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SkillsSection } from "../../src/features/profile/SkillsSection";
import {
  normalizeTech,
  projectsUsing,
} from "../../src/features/profile/skill-projects";

const PROJECTS = [
  { slug: "a", title: "A", stack: ["React", "Express"] },
  { slug: "b", title: "B", stack: ["Tailwind CSS", "Node.js"] },
  { slug: "c", title: "C", stack: ["React"] },
];

describe("skill → project matching", () => {
  it("treats different spellings of a tool as the same", () => {
    expect(normalizeTech("Express.js")).toBe(normalizeTech("Express"));
    expect(normalizeTech("Tailwind CSS")).toBe("tailwindcss");
    expect(normalizeTech("C++")).toBe("c++");
  });

  it("returns the projects that list a skill, in order", () => {
    expect(projectsUsing("React", PROJECTS)).toEqual([
      { slug: "a", title: "A" },
      { slug: "c", title: "C" },
    ]);
    expect(projectsUsing("Express.js", PROJECTS)).toEqual([
      { slug: "a", title: "A" },
    ]);
    expect(projectsUsing("Data Structures", PROJECTS)).toEqual([]);
  });
});

describe("SkillsSection", () => {
  function renderSkills() {
    return render(
      <MemoryRouter>
        <SkillsSection />
      </MemoryRouter>,
    );
  }

  it("makes only skills with project evidence pressable", () => {
    renderSkills();
    expect(
      screen.getByRole("button", { name: /^React, used in \d+ projects?$/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Data Structures/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Data Structures")).toBeInTheDocument();
  });

  it("shows the projects using a skill, and closes with Escape", () => {
    renderSkills();
    const react = screen.getByRole("button", { name: /^React, used in/ });
    fireEvent.click(react);
    expect(react).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(react.getAttribute("aria-controls"));
    expect(within(panel).getByText("React is used in")).toBeInTheDocument();
    expect(within(panel).getAllByRole("link").length).toBeGreaterThan(0);
    expect(within(panel).getAllByRole("link")[0].getAttribute("href")).toMatch(
      /^\/work\//,
    );

    fireEvent.keyDown(within(panel).getAllByRole("link")[0], {
      key: "Escape",
    });
    expect(react).toHaveAttribute("aria-expanded", "false");
    expect(react).toHaveFocus();
  });
});
