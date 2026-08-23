import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { projects } from "../../src/data/projects";

// WorkPage is lazy-loaded (see route-config.jsx), so every test below first
// awaits an element to resolve the Suspense boundary before running further
// synchronous queries.

describe("WorkPage", () => {
  it("derives its project count from the project data set", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText(
        new RegExp(`${projects.length} projects? shown below`),
      ),
    ).toBeInTheDocument();
  });

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

  it("shows the flagship project's role and timeline metadata", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Sole Developer")).toBeInTheDocument();
    expect(screen.getByText("July–August")).toBeInTheDocument();
  });

  it("renders placeholder covers for supporting projects without a real cover image", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("img", { name: "Bang Learner project cover" }),
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
