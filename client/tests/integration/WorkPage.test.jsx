import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { projects } from "../../src/data/projects";

// WorkPage is lazy-loaded (see route-config.jsx), so every test below first
// awaits an element to resolve the Suspense boundary before running further
// synchronous queries.

describe("WorkPage", () => {
  it("lists Sarabo as the leading flagship case study", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    await screen.findByRole("heading", { level: 1 });
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0]).toHaveTextContent("Sarabo");
  });

  it("renders every project from the data set", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    await screen.findByRole("heading", { level: 1 });
    projects.forEach((project) => {
      expect(
        screen.getByRole("link", { name: project.title }),
      ).toBeInTheDocument();
    });
  });

  it("does not render an empty archive section", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText("Archive")).not.toBeInTheDocument();
  });

  it("renders a real cover when available and a monogram otherwise", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("img", { name: "Sarabo project cover" }),
    ).toHaveAttribute("src", "/assets/projects/sarabo/cover.webp");
    // Projects without a cover show a monogram tile, not a placeholder image.
    expect(
      screen.queryByRole("img", { name: "Bangladesh Landscape project cover" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("BL")).toBeInTheDocument();
  });
});
