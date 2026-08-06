import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SiteHeader } from "../../src/components/navigation/SiteHeader";

describe("SiteHeader active navigation", () => {
  it("marks the current route's link as the active page", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <SiteHeader />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const aboutLink = within(nav).getByRole("link", { name: "About" });
    const workLink = within(nav).getByRole("link", { name: "Work" });

    expect(aboutLink).toHaveAttribute("aria-current", "page");
    expect(workLink).not.toHaveAttribute("aria-current");
  });

  it("does not mark Home as active on other routes", () => {
    render(
      <MemoryRouter initialEntries={["/work"]}>
        <SiteHeader />
      </MemoryRouter>,
    );

    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
