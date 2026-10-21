import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { FocusBrackets } from "../../src/components/ui/FocusBrackets";

describe("FocusBrackets", () => {
  it("renders one decorative span hidden from assistive tech", () => {
    const { container } = render(<FocusBrackets />);
    const mark = container.firstChild;
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("focus-brackets");
    expect(mark).not.toHaveClass("focus-brackets-inside");
  });

  it("keeps the corners inside the card when asked", () => {
    const { container } = render(<FocusBrackets inside />);
    expect(container.firstChild).toHaveClass("focus-brackets-inside");
  });
});
