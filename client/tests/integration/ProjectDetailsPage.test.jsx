import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

// ProjectDetailsPage is lazy-loaded (see route-config.jsx), so every test
// below first awaits an element to resolve the Suspense boundary before
// running further synchronous queries.

describe("Project detail route", () => {
  it("renders a controlled not-found state for an unsupported slug", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/some-unsupported-slug"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Project not found",
      }),
    ).toBeInTheDocument();
  });

  it("does not crash for any slug value", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/"],
    });
    expect(() => render(<RouterProvider router={router} />)).not.toThrow();
  });

  it("renders the complete Sarabo case study structure", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Sarabo" }),
    ).toBeInTheDocument();
    [
      "Overview",
      "Roles",
      "Workflow",
      "Capabilities",
      "Architecture",
      "Implementation approach",
      "Challenge, outcome and reflection",
    ].forEach((heading) => {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    });
  });

  it("shows restrained, non-fabricated challenge, outcome, and reflection content", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText(/Validation was one of the main implementation/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Quantitative product outcomes and usage metrics are not currently available/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Building Sarabo as a solo project/),
    ).toBeInTheDocument();
  });

  it("shows the confirmed role and timeline in project metadata", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Sole Developer")).toBeInTheDocument();
    expect(screen.getByText("July–August")).toBeInTheDocument();
  });

  it("describes the workflow as a cautious lifecycle summary, not a fixed step sequence", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText(
        /Sarabo supports a repair-request lifecycle covering/,
      ),
    ).toBeInTheDocument();
  });

  it("does not render an empty heading for an omitted optional section", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    await screen.findByRole("heading", { level: 1 });
    // Sarabo's case study has no dedicated "next steps" section since no
    // verified content exists for it — it must not appear as an empty
    // heading anywhere on the page.
    expect(
      screen.queryByRole("heading", { name: /next steps/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a preparation state for a known incomplete project", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/bangladesh-landscape"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Bangladesh Landscape",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/still in preparation/)).toBeInTheDocument();
  });

  it("renders the complete Bang Learner case study structure", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/bang-learner"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Bang Learner" }),
    ).toBeInTheDocument();
    // Confirmed role and timeline (intake Q7, 2026-09-29).
    expect(screen.getByText("Sole Developer")).toBeInTheDocument();
    expect(screen.getByText("March–April 2025")).toBeInTheDocument();
    // Complete case-study sections, including the captioned gallery.
    for (const heading of [
      "Overview",
      "Roles",
      "Capabilities",
      "Gallery",
      "Architecture",
      "Implementation approach",
      "Challenge, outcome and reflection",
    ]) {
      expect(
        screen.getAllByRole("heading", { name: heading }).length,
      ).toBeGreaterThan(0);
    }
    expect(
      screen.getByAltText("Browsing the skill catalog by category"),
    ).toBeInTheDocument();
    expect(screen.getByText(/publicly deployed platform/)).toBeInTheDocument();
    expect(screen.queryByText(/still in preparation/)).not.toBeInTheDocument();
  });

  it("shows Bangladesh Landscape's verified capabilities and repositories on its project-overview page", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/bangladesh-landscape"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Bangladesh Landscape",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Verified guide and partner bookings"),
    ).toBeInTheDocument();
    // Links appear in both the hero and body, and related-project cards
    // contribute their own repository links — assert by href membership.
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toContain(
      "https://github.com/jahidjubaer/bangladesh-landscape-client",
    );
    expect(hrefs).toContain(
      "https://github.com/jahidjubaer/bangladesh-landscape-server",
    );
  });

  it("shows related projects on the Sarabo case study", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Related projects",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Bang Learner" }),
    ).toBeInTheDocument();
  });

  it("sets project-specific document metadata", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    await screen.findByRole("heading", { level: 1 });
    expect(document.title).toBe("Sarabo — Case study — Jahid Hasan");
  });
});
