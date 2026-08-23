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

// BeyondPage is lazy-loaded (see route-config.jsx), so every test below
// first awaits its H1 (or another element) to resolve the Suspense
// boundary before running further synchronous queries.

describe("BeyondPage", () => {
  it("activates the STORY identity", async () => {
    renderBeyond();
    await screen.findByRole("heading", { level: 1 });
    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "story",
    );
  });

  it("renders exactly one H1", async () => {
    renderBeyond();
    expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the honest photography empty state when no images are available", async () => {
    renderBeyond();
    expect(
      await screen.findByText(
        "A curated photography selection is being prepared.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render a category filter or viewer when there is nothing to show", async () => {
    renderBeyond();
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.queryByRole("group", { name: "Filter photography by category" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Sports section with verified content", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("heading", { name: "Sports" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/cricket/i).length).toBeGreaterThan(0);
  });

  it("renders every verified leadership role", async () => {
    renderBeyond();
    await screen.findByRole("heading", { level: 1 });
    leadershipRoles.forEach((role) => {
      expect(screen.getByText(role.description)).toBeInTheDocument();
    });
  });

  it("renders the Volunteering section with verified content", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("heading", { name: "Volunteering" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Red Crescent Youth/)).toBeInTheDocument();
  });

  it("links to contact for further connection", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("link", { name: "Get in touch" }),
    ).toHaveAttribute("href", "/contact");
  });
});
