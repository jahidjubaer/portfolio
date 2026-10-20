import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, UNSAFE_ViewTransitionContext } from "react-router-dom";
import { ProjectCard } from "../../src/features/projects/ProjectCard";
import { Reveal } from "../../src/features/motion/Reveal";
import { MotionProvider } from "../../src/features/motion/MotionProvider";
import { projectCoverTransition } from "../../src/features/motion/route-transition";

vi.mock("../../src/lib/hydration", async (importOriginal) => ({
  ...(await importOriginal()),
  useIsHydrating: () => false,
}));

const project = {
  slug: "sarabo",
  title: "Sarabo",
  summary: "A multi-role electronics-repair service platform.",
  status: "live",
  caseStudyStatus: "complete",
  stack: ["React"],
  links: [],
};

function transitionBetween(from, to) {
  return {
    isTransitioning: true,
    flushSync: false,
    currentLocation: { pathname: from },
    nextLocation: { pathname: to },
  };
}

function renderWithTransition(ui, transition) {
  return render(
    <MemoryRouter>
      <UNSAFE_ViewTransitionContext.Provider value={transition}>
        <MotionProvider>{ui}</MotionProvider>
      </UNSAFE_ViewTransitionContext.Provider>
    </MemoryRouter>,
  );
}

function coverOf(container) {
  return container.querySelector(".project-media-gradient");
}

describe("projectCoverTransition", () => {
  it("names nothing outside a transition", () => {
    expect(projectCoverTransition("sarabo", false)).toBeUndefined();
  });

  it("gives a valid, slug-specific name", () => {
    expect(projectCoverTransition("ict crack.v2", true)).toEqual({
      viewTransitionName: "project-cover-ict-crack-v2",
      viewTransitionClass: "project-cover",
    });
  });
});

describe("ProjectCard shared cover", () => {
  it("is unnamed when no transition runs", () => {
    const { container } = renderWithTransition(
      <ProjectCard project={project} />,
      { isTransitioning: false },
    );
    expect(coverOf(container).style.viewTransitionName ?? "").toBe("");
  });

  it("is named while its own case study is the transition's target", () => {
    const { container } = renderWithTransition(
      <ProjectCard project={project} />,
      transitionBetween("/work", "/work/sarabo"),
    );
    expect(coverOf(container).getAttribute("style")).toContain(
      "view-transition-name: project-cover-sarabo",
    );
  });

  it("is named on the way back from its case study", () => {
    const { container } = renderWithTransition(
      <ProjectCard project={project} />,
      transitionBetween("/work/sarabo", "/work"),
    );
    expect(coverOf(container).getAttribute("style")).toContain(
      "project-cover-sarabo",
    );
  });

  it("stays unnamed when another project is transitioning", () => {
    const { container } = renderWithTransition(
      <ProjectCard project={project} />,
      transitionBetween("/work", "/work/bang-learner"),
    );
    expect(coverOf(container).getAttribute("style") ?? "").not.toContain(
      "view-transition-name",
    );
  });
});

describe("Reveal during a view transition", () => {
  it("starts hidden on an ordinary client render", () => {
    renderWithTransition(<Reveal>Hero</Reveal>, { isTransitioning: false });
    expect(screen.getByText("Hero")).toHaveStyle({ opacity: "0" });
  });

  it("starts visible so the browser captures the finished page", () => {
    renderWithTransition(
      <Reveal>Hero</Reveal>,
      transitionBetween("/work", "/work/sarabo"),
    );
    expect(screen.getByText("Hero")).not.toHaveStyle({ opacity: "0" });
  });
});
