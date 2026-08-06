import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

describe("AppLayout", () => {
  it("renders header, main, and footer landmarks together", () => {
    const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("closes the mobile menu after navigating to a new route", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routeConfig, {
      initialEntries: ["/"],
    });
    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });

    await user.click(within(mobileNav).getByRole("link", { name: "About" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "About Jahid" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
