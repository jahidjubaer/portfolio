import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter } from "react-router-dom";
import { App } from "../../src/App";
import { routeConfig } from "../../src/routes/route-config";

describe("App", () => {
  it("renders a skip link as the first focusable element", () => {
    render(<App router={createMemoryRouter(routeConfig)} />);

    const skipLink = screen.getByRole("link", {
      name: "Skip to main content",
    });
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });
});
