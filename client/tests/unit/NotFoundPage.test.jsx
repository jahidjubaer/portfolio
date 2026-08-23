import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

describe("Unknown route", () => {
  it("renders the 404 page for an unrecognized path", async () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/this-route-does-not-exist"],
    });
    render(<RouterProvider router={router} />);

    // NotFoundPage is lazy-loaded (see route-config.jsx).
    expect(
      await screen.findByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
  });
});
