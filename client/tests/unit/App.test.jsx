import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

describe("App", () => {
  it("renders a skip link as the first focusable element", () => {
    render(<App />);

    const skipLink = screen.getByRole("link", {
      name: "Skip to main content",
    });
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });
});
