import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

describe("Unknown route", () => {
  it("renders the 404 page for an unrecognized path", () => {
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/this-route-does-not-exist"],
    });
    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
  });
});
