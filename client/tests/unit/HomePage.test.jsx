import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routeConfig } from "../../src/routes/route-config";
import { profile } from "../../src/data/profile";

function renderHome(entry = "/") {
  const router = createMemoryRouter(routeConfig, { initialEntries: [entry] });
  render(<RouterProvider router={router} />);
  return router;
}

describe("HomePage (profile)", () => {
  it("renders a single visible H1 with Jahid's name", () => {
    renderHome();
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(profile.name);
  });

  it("shows the headline, open-to-roles status, and target roles", () => {
    renderHome();
    expect(screen.getByText(profile.heroHeadline)).toBeInTheDocument();
    expect(screen.getAllByText("Open to new roles").length).toBeGreaterThan(0);
    for (const role of profile.targetRoles) {
      expect(screen.getByText(role)).toBeInTheDocument();
    }
  });

  it("opens on the Resume tab with About and Experience sections", () => {
    renderHome();
    expect(screen.getByRole("tab", { name: "Resume" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "About" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Experience & leadership",
      }),
    ).toBeInTheDocument();
  });

  it("switches to the Work tab and records it in the URL", async () => {
    const user = userEvent.setup();
    const router = renderHome();

    await user.click(screen.getByRole("tab", { name: "Work" }));

    expect(screen.getByRole("tab", { name: "Work" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(router.state.location.search).toBe("?tab=work");
    expect(screen.getByRole("link", { name: "Sarabo" })).toHaveAttribute(
      "href",
      "/work/sarabo",
    );
  });

  it("moves between tabs with the arrow keys", async () => {
    const user = userEvent.setup();
    renderHome();

    screen.getByRole("tab", { name: "Resume" }).focus();
    await user.keyboard("{ArrowRight}");

    const work = screen.getByRole("tab", { name: "Work" });
    expect(work).toHaveFocus();
    expect(work).toHaveAttribute("aria-selected", "true");
  });

  it("links to the contact page from the header", () => {
    renderHome();
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
