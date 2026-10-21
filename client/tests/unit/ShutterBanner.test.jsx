import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { projects } from "../../src/data/projects";
import { HEADLINE_TECH } from "../../src/features/profile/headline-tech";
import {
  buildShutterItems,
  freeLights,
  itemAt,
} from "../../src/features/profile/shutter-items";
import { BOKEH } from "../../src/features/profile/viewfinder";

const items = buildShutterItems({
  projects,
  tech: HEADLINE_TECH,
  bokeh: BOKEH,
});

function renderHome() {
  const router = createMemoryRouter(routeConfig, { initialEntries: ["/"] });
  render(<RouterProvider router={router} />);
}

const shootButton = () =>
  screen.getByRole("button", { name: "Shoot a project or technology" });

describe("shutter items", () => {
  it("puts every project and headline technology on its own light", () => {
    expect(items).toHaveLength(projects.length + HEADLINE_TECH.length);
    const spots = new Set(items.map((item) => `${item.x},${item.y}`));
    expect(spots.size).toBe(items.length);
    // A project, then two technologies, so shots alternate.
    expect(items.slice(0, 3).map((item) => item.kind)).toEqual([
      "project",
      "skill",
      "skill",
    ]);
  });

  it("keeps items off the lights behind the portrait and the Shoot button", () => {
    const free = freeLights([
      [0.5, 0.8, 0.1, 0],
      [0.5, 0.2, 0.1, 0],
      [0.1, 0.8, 0.1, 0],
    ]);
    expect(free).toEqual([[0.1, 0.8, 0.1, 0]]);
  });

  it("finds the item within reach of a point, nearest first", () => {
    const pair = [
      { id: "a", x: 0.1, y: 0.5 },
      { id: "b", x: 0.2, y: 0.5 },
    ];
    const size = { width: 1000, height: 200, reach: 40 };
    expect(itemAt(pair, { x: 190, y: 100 }, size).id).toBe("b");
    expect(itemAt(pair, { x: 500, y: 100 }, size)).toBeNull();
  });

  it("notes which projects use a technology, from their stacks", () => {
    const react = items.find((item) => item.id === "skill:React");
    const usingReact = projects.filter((project) =>
      project.stack.some((tech) => tech.toLowerCase() === "react"),
    );
    expect(react.usedIn.map((project) => project.slug)).toEqual(
      usingReact.map((project) => project.slug),
    );
  });
});

describe("ProfileBanner shutter", () => {
  it("prints the items in order, links a project's print, and keeps three", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(shootButton());
    const first = screen.getByRole("article", {
      name: `Print: ${items[0].name}`,
    });
    expect(
      within(first).getByRole("link", { name: items[0].name }),
    ).toHaveAttribute("href", `/work/${items[0].slug}`);
    expect(
      screen.getByText(`Took a shot of ${items[0].name}.`),
    ).toHaveAttribute("aria-live", "polite");

    await user.click(shootButton());
    expect(
      screen.getByRole("article", { name: `Print: ${items[1].name}` }),
    ).toBeInTheDocument();
    // The older print lies behind, hidden from assistive technology.
    expect(
      screen.queryByRole("article", { name: `Print: ${items[0].name}` }),
    ).toBeNull();

    await user.click(shootButton());
    await user.click(shootButton());
    // The fourth shot pushes the oldest print out (after its exit).
    await waitFor(() =>
      expect(
        document.querySelectorAll("[data-banner-prints] > article"),
      ).toHaveLength(3),
    );
  });

  it("clears the prints with Escape or ✕ and returns focus to Shoot", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(shootButton());
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("article", { name: /^Print:/ })).toBeNull(),
    );
    expect(shootButton()).toHaveFocus();
    expect(screen.getByText("Prints cleared.")).toBeInTheDocument();

    await user.click(shootButton());
    await user.click(screen.getByRole("button", { name: "Clear the prints" }));
    await waitFor(() =>
      expect(screen.queryByRole("article", { name: /^Print:/ })).toBeNull(),
    );
    expect(shootButton()).toHaveFocus();
  });
});
