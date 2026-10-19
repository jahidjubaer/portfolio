import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

const routes = [
  { path: "/", heading: "Jahid Hasan" },
  { path: "/work", heading: "Projects" },
  // /about redirects to the profile, which now holds its content.
  { path: "/about", heading: "Jahid Hasan" },
  { path: "/beyond", heading: "Beyond the code." },
  { path: "/contact", heading: "Contact" },
  { path: "/resume", heading: "Jahid Hasan" },
];

describe("Main application routes", () => {
  it("renders the homepage synchronously, without a loading fallback", () => {
    // HomePage is the one eager route (see route-config.jsx) — its H1 must
    // be available on the very first render, with no Suspense flash.
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Jahid Hasan",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading page…")).not.toBeInTheDocument();
  });

  it.each(routes)("renders $path with its H1", async ({ path, heading }) => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: [path],
    });
    render(<RouterProvider router={router} />);

    // Secondary routes are lazy-loaded (see route-config.jsx), so their
    // content mounts after the Suspense fallback resolves.
    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
  });
});
