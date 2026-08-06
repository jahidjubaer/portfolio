import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

describe("Project detail route", () => {
  it("renders a controlled not-found state for an unsupported slug", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/some-unsupported-slug"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Project not found" }),
    ).toBeInTheDocument();
  });

  it("does not crash for any slug value", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/"],
    });
    expect(() => render(<RouterProvider router={router} />)).not.toThrow();
  });

  it("renders the complete Sarabo case study structure", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Sarabo" }),
    ).toBeInTheDocument();
    [
      "Overview",
      "Roles",
      "Workflow",
      "Capabilities",
      "Architecture",
      "Engineering decisions",
      "Challenge, outcome and reflection",
    ].forEach((heading) => {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    });
  });

  it("shows a restrained note instead of fabricated challenge/outcome content", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByText(
        "Detailed implementation notes for this section are still being prepared.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render an empty heading for an omitted optional section", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    // Sarabo's case study has no dedicated "next steps" section since no
    // verified content exists for it — it must not appear as an empty
    // heading anywhere on the page.
    expect(
      screen.queryByRole("heading", { name: /next steps/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a preparation state for a known incomplete project", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/bang-learner"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Bang Learner" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/still in preparation/)).toBeInTheDocument();
  });

  it("shows related projects on the Sarabo case study", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Related projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Bang Learner" }),
    ).toBeInTheDocument();
  });

  it("sets project-specific document metadata", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(document.title).toBe("Sarabo — Case study — Jahid Hasan");
  });
});
