import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { projects } from "../../src/data/projects";

describe("Homepage featured projects", () => {
  it("links Sarabo directly to its case study route", () => {
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("link", { name: "Sarabo" })).toHaveAttribute(
      "href",
      "/work/sarabo",
    );
  });

  it("renders every featured project from the central data source", () => {
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    projects
      .filter((project) => project.featured)
      .forEach((project) => {
        expect(
          screen.getByRole("link", { name: project.title }),
        ).toBeInTheDocument();
      });
  });
});
