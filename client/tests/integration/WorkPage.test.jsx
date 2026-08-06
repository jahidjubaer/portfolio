import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { projects } from "../../src/data/projects";

describe("WorkPage", () => {
  it("derives its project count from the project data set", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText(new RegExp(`${projects.length} projects? shown below`)),
    ).toBeInTheDocument();
  });

  it("lists Sarabo as the leading flagship case study", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0]).toHaveTextContent("Sarabo");
  });

  it("renders every project from the data set", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    projects.forEach((project) => {
      expect(
        screen.getByRole("link", { name: project.title }),
      ).toBeInTheDocument();
    });
  });
});
