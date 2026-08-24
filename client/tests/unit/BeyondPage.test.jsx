import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { leadershipRoles } from "../../src/data/leadership";

const getPhotographyPhotos = vi.fn();
vi.mock("../../src/lib/api", () => ({
  getPhotographyPhotos: (...args) => getPhotographyPhotos(...args),
}));

import { routeConfig } from "../../src/routes/route-config";

const BLOGGER_PHOTO = {
  id: "post-1-0",
  src: "https://blogger.googleusercontent.com/img/b/abc/s1600/photo.jpg",
  thumbnail: "https://blogger.googleusercontent.com/img/b/abc/s500/photo.jpg",
  title: "Blue sky Nature",
  alt: "Blue sky Nature",
  caption: "Blue sky Nature",
  category: "Nature",
  postUrl:
    "https://jahid-thecapturecrew.blogspot.com/2026/06/blue-sky-nature.html",
  publishedAt: "2026-06-30T12:12:12.987-07:00",
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
    // Matches the real unconfigured/no-local-fallback production default —
    // every pre-existing test below relies on this exact outcome ("being
    // prepared", not an error) unless it overrides the mock itself.
    getPhotographyPhotos
      .mockReset()
      .mockResolvedValue({ success: true, configured: false, photos: [] });
  });

  it("activates the STORY identity", async () => {
    renderBeyond();
    await screen.findByRole("heading", { level: 1 });
    expect(document.documentElement.getAttribute("data-identity")).toBe(
      "story",
    );
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
      screen.queryByRole("group", { name: "Filter photography by category" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the Sports section with verified content", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("heading", { name: "Sports" }),
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
      await screen.findByRole("heading", { name: "Volunteering" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Red Crescent Youth/)).toBeInTheDocument();
  });

  it("links to contact for further connection", async () => {
    renderBeyond();
    expect(
      await screen.findByRole("link", { name: "Get in touch" }),
    ).toHaveAttribute("href", "/contact");
  });

  describe("Blogger photography", () => {
    it("renders real Blogger photographs as a gallery instead of the empty state", async () => {
      getPhotographyPhotos.mockResolvedValue({
        success: true,
        configured: true,
        photos: [BLOGGER_PHOTO],
      });
      renderBeyond();

      expect(
        await screen.findByRole("img", { name: BLOGGER_PHOTO.alt }),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "A curated photography selection is being prepared.",
        ),
      ).not.toBeInTheDocument();
    });

    it("opens the viewer with a working link back to the original Blogger post", async () => {
      getPhotographyPhotos.mockResolvedValue({
        success: true,
        configured: true,
        photos: [BLOGGER_PHOTO],
      });
      const user = userEvent.setup();
      renderBeyond();

      await user.click(
        await screen.findByRole("img", { name: BLOGGER_PHOTO.alt }),
      );

      const originalPostLink = await screen.findByRole("link", {
        name: /view original post/i,
      });
      expect(originalPostLink).toHaveAttribute("href", BLOGGER_PHOTO.postUrl);
      expect(originalPostLink).toHaveAttribute("target", "_blank");
      expect(originalPostLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows a loading status before Blogger photography resolves", async () => {
      getPhotographyPhotos.mockReturnValue(new Promise(() => {})); // never resolves
      renderBeyond();

      await screen.findByRole("heading", { level: 1 });
      expect(screen.getByRole("status")).toHaveTextContent(
        "Loading photography…",
      );
    });

    it("shows a retryable error state on upstream failure, then recovers", async () => {
      getPhotographyPhotos.mockResolvedValue({
        success: false,
        message: "Photography couldn't be loaded right now.",
      });
      const user = userEvent.setup();
      renderBeyond();

      const alert = await screen.findByRole("alert");
      expect(alert).toHaveTextContent(
        "Photography couldn't be loaded right now.",
      );

      getPhotographyPhotos.mockResolvedValue({
        success: true,
        configured: true,
        photos: [BLOGGER_PHOTO],
      });
      await user.click(screen.getByRole("button", { name: "Retry" }));

      expect(
        await screen.findByRole("img", { name: BLOGGER_PHOTO.alt }),
      ).toBeInTheDocument();
    });
  });
});
