import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectSection } from "../../../src/features/projects/ProjectSection";

describe("ProjectSection", () => {
  it("renders its heading and content when children are present", () => {
    render(
      <ProjectSection id="overview" heading="Overview">
        <p>Some content.</p>
      </ProjectSection>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Some content.")).toBeInTheDocument();
  });

  it("renders nothing when children is null, avoiding an empty heading", () => {
    const { container } = render(
      <ProjectSection id="decisions" heading="Engineering decisions">
        {null}
      </ProjectSection>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when all children are falsy", () => {
    const { container } = render(
      <ProjectSection id="decisions" heading="Engineering decisions">
        {false}
        {undefined}
      </ProjectSection>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
