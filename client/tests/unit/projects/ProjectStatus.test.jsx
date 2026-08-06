import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectStatus } from "../../../src/features/projects/ProjectStatus";

describe("ProjectStatus", () => {
  it("renders a text label alongside the status tone, never color alone", () => {
    render(
      <ProjectStatus
        project={{ status: "live", caseStudyStatus: "complete" }}
      />,
    );
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Full case study")).toBeInTheDocument();
  });

  it("omits the case-study line when caseStudyStatus is 'none'", () => {
    render(
      <ProjectStatus
        project={{ status: "archived", caseStudyStatus: "none" }}
      />,
    );
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(screen.queryByText(/case study/i)).not.toBeInTheDocument();
  });
});
