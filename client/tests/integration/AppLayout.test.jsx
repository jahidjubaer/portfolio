import { afterEach, describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";

function renderApp(entry = "/") {
  const router = createMemoryRouter(routeConfig, { initialEntries: [entry] });
  render(<RouterProvider router={router} />);
  return router;
}

function getSidebar() {
  return screen.getByRole("complementary", { name: "Sidebar" });
}

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("AppLayout (three-column shell)", () => {
  it("renders the sidebar, main content, and highlights rail", () => {
    renderApp();
    expect(getSidebar()).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Highlights" }),
    ).toBeInTheDocument();
  });

  it("navigates from the sidebar and marks the active route", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      within(getSidebar()).getByRole("link", { name: "Projects" }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Projects" }),
    ).toBeInTheDocument();
    expect(
      within(getSidebar()).getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("toggles the theme and remembers the choice", async () => {
    const user = userEvent.setup();
    renderApp();
    const initial = document.documentElement.getAttribute("data-theme");
    const next = initial === "dark" ? "light" : "dark";

    await user.click(
      within(getSidebar()).getByRole("button", {
        name: /switch to (light|dark) mode/i,
      }),
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe(next);
    expect(window.localStorage.getItem("theme")).toBe(next);
  });

  it("mutes and unmutes UI sounds", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      within(getSidebar()).getByRole("button", { name: "Mute sounds" }),
    );

    expect(
      within(getSidebar()).getByRole("button", { name: "Turn sounds on" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("sound")).toBe("off");
  });

  it("lists recent GitHub repositories in the highlights rail", () => {
    renderApp();
    const rail = screen.getByRole("complementary", { name: "Highlights" });
    expect(
      within(rail).getByRole("heading", { name: "Recently on GitHub" }),
    ).toBeInTheDocument();
    expect(
      within(rail).getByRole("link", { name: "View sarabo-client on GitHub" }),
    ).toHaveAttribute("href", "https://github.com/jahidjubaer/sarabo-client");
  });
});
