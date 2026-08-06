import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { leadershipRoles } from "../../src/data/leadership";

function renderBeyond() {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: ["/beyond"],
  });
  render(<RouterProvider router={router} />);
}

describe("BeyondPage", () => {
  it("activates the STORY identity", () => {
    renderBeyond();
    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "story",
    );
  });

  it("renders exactly one H1", () => {
    renderBeyond();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the honest photography empty state when no images are available", () => {
    renderBeyond();
    expect(
      screen.getByText("A curated photography selection is being prepared."),
    ).toBeInTheDocument();
  });

  it("does not render a category filter or viewer when there is nothing to show", () => {
    renderBeyond();
    expect(
      screen.queryByRole("group", { name: "Filter photography by category" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Sports section with verified content", () => {
    renderBeyond();
    expect(screen.getByRole("heading", { name: "Sports" })).toBeInTheDocument();
    expect(screen.getAllByText(/cricket/i).length).toBeGreaterThan(0);
  });

  it("renders every verified leadership role", () => {
    renderBeyond();
    leadershipRoles.forEach((role) => {
      expect(screen.getByText(role.description)).toBeInTheDocument();
    });
  });

  it("renders the Volunteering section with verified content", () => {
    renderBeyond();
    expect(
      screen.getByRole("heading", { name: "Volunteering" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Red Crescent Youth/)).toBeInTheDocument();
  });

  it("links to contact for further connection", () => {
    renderBeyond();
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
