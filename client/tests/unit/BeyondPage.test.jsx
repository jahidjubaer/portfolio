import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { leadershipRoles } from "../../src/data/leadership";

// The gallery reads the published snapshot; each test sets what's in it.
const gallery = vi.hoisted(() => ({ photographs: [] }));
vi.mock("../../src/data/photography", () => ({
  get photographs() {
    return gallery.photographs;
  },
}));

import { routeConfig } from "../../src/routes/route-config";

const PHOTO = {
  id: "2026-06-blue-sky-nature",
  src: "https://store.public.blob.vercel-storage.com/photos/blue-sky.jpg",
  width: 1600,
  height: 1067,
  title: "Blue sky Nature",
  alt: "Blue sky Nature",
  category: "Nature",
};

function renderBeyond() {
  const router = createMemoryRouter(routeConfig, {
    initialEntries: ["/beyond"],
  });
  render(<RouterProvider router={router} />);
}

// BeyondPage is lazy-loaded (see route-config.jsx), so every test below
// first awaits its H1 (or another element) to resolve the Suspense
// boundary before running further synchronous queries.

describe("BeyondPage", () => {
  beforeEach(() => {
    gallery.photographs = [];
  });

  it("renders exactly one H1", async () => {
    renderBeyond();
    expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the honest photography empty state when no images are available", async () => {
    renderBeyond();
    expect(
      await screen.findByText(
        "A curated photography selection is being prepared.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render a category filter or viewer when there is nothing to show", async () => {
    renderBeyond();
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.queryByRole("group", { name: "Filter photography by album" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Sports section with verified content", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("heading", {
        name: "Sports & Athletics Leadership",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/cricket/i).length).toBeGreaterThan(0);
  });

  it("renders every verified leadership role", async () => {
    renderBeyond();
    await screen.findByRole("heading", { level: 1 });
    leadershipRoles.forEach((role) => {
      expect(screen.getByText(role.description)).toBeInTheDocument();
    });
  });

  it("renders the Volunteering section with verified content", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("heading", {
        name: "Volunteering & Social Impact",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Red Crescent Youth/)).toBeInTheDocument();
  });

  it("links to contact for further connection", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("link", { name: "Get in touch" }),
    ).toHaveAttribute("href", "/contact");
  });

  describe("photography", () => {
    it("shows the published photographs instead of the empty state", async () => {
      gallery.photographs = [PHOTO];
      renderBeyond();

      const image = await screen.findByRole("img", { name: PHOTO.alt });
      expect(image).toHaveAttribute("src", PHOTO.src);
      expect(image).toHaveAttribute("width", "1600");
      expect(
        screen.queryByText(
          "A curated photography selection is being prepared.",
        ),
      ).not.toBeInTheDocument();
    });

    it("opens the viewer with the caption and no link off the site", async () => {
      gallery.photographs = [PHOTO];
      const user = userEvent.setup();
      renderBeyond();

      await user.click(await screen.findByRole("img", { name: PHOTO.alt }));

      const viewer = await screen.findByRole("dialog");
      expect(viewer).toHaveTextContent("Blue sky Nature");
      expect(screen.queryByRole("link", { name: /original post/i })).toBeNull();
    });
  });
});
