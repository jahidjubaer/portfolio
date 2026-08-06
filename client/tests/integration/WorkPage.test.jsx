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

  it("does not render an empty archive section", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(screen.queryByText("Archive")).not.toBeInTheDocument();
  });

  it("shows the flagship project's role and timeline metadata", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Sole Developer")).toBeInTheDocument();
    expect(screen.getByText("July–August")).toBeInTheDocument();
  });

  it("renders placeholder covers for supporting projects without a real cover image", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("img", { name: "Bang Learner project cover" }),
    ).toHaveAttribute(
      "src",
      "/assets/placeholders/project-cover-placeholder.svg",
    );
    expect(
      screen.getByRole("img", { name: "Note Bank project cover" }),
    ).toHaveAttribute(
      "src",
      "/assets/placeholders/project-cover-placeholder.svg",
    );
  });
});
