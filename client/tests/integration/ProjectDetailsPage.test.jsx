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
    ["Problem", "What I built", "How it works", "Result and next"].forEach(
      (heading) => {
        expect(
          screen.getByRole("heading", { level: 2, name: heading }),
        ).toBeInTheDocument();
      },
    );
    // "The hard part" is still blank, so it isn't shown, and nor is a
    // screenshot gallery: the cover is the only picture.
    expect(
      screen.queryByRole("heading", { name: "The hard part" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /cover|sarabo/i })).toHaveLength(
      1,
    );
  });

  it("states the result without invented numbers", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText(/There are no usage numbers to report/),
    ).toBeInTheDocument();
    expect(screen.getByText(/refining validation/)).toBeInTheDocument();
  });

  it("shows the confirmed role and timeline in project metadata", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Sole Developer")).toBeInTheDocument();
    expect(screen.getByText("July–August")).toBeInTheDocument();
  });

  it("describes the repair-request lifecycle", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/sarabo"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText(/service selection, submission, quotation/),
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

  it("shows ICT Crack's verified live site and public repositories", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/work/ict-crack"],
    });
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "ICT Crack" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/still in preparation/)).toBeInTheDocument();
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("https://hsc-ict-creck-client.vercel.app");
    expect(hrefs).toContain(
      "https://github.com/jahidjubaer/hsc-ict-creck-client",
    );
    expect(hrefs).toContain(
      "https://github.com/jahidjubaer/hsc-ict-creck-server",
    );
  });

  it("shows Bangladesh Landscape's verified capabilities without linking its private repositories", async () => {
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
    expect(screen.getAllByText("Private repository").length).toBeGreaterThan(0);
    const hrefs = screen
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs.some((href) => href?.includes("bangladesh-landscape-"))).toBe(
      false,
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
    expect(screen.getByRole("link", { name: "ICT Crack" })).toBeInTheDocument();
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
