import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { TechLogo } from "../../src/components/icons/TechIcons";

describe("TechLogo", () => {
  it("draws a known logo in its brand color, hidden from assistive tech", () => {
    const { container } = render(<TechLogo name="React" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("fill", "#61DAFB");
  });

  it("uses the text color for a logo without a usable brand color", () => {
    const { container } = render(<TechLogo name="Express.js" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "fill",
      "currentColor",
    );
  });

  it("renders nothing for an unknown technology", () => {
    const { container } = render(<TechLogo name="Cobol" />);
    expect(container).toBeEmptyDOMElement();
  });
});
