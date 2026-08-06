import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseStudyUnavailable } from "../../../src/features/projects/CaseStudyUnavailable";

describe("CaseStudyUnavailable", () => {
  it("renders the default restrained message", () => {
    render(<CaseStudyUnavailable />);
    expect(
      screen.getByText(
        "Detailed implementation notes for this section are still being prepared.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a custom message when provided", () => {
    render(<CaseStudyUnavailable message="Custom note." />);
    expect(screen.getByText("Custom note.")).toBeInTheDocument();
  });

  it("never renders a literal TODO_CONTENT value", () => {
    render(<CaseStudyUnavailable />);
    expect(screen.queryByText(/TODO_CONTENT/)).not.toBeInTheDocument();
  });
});
