import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

// Posts come from the published snapshot; each test sets what's in it.
const store = vi.hoisted(() => ({ posts: [] }));
vi.mock("../../src/data/posts", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    get posts() {
      return original.sortPosts(store.posts);
    },
    getPost: (slug) => store.posts.find((post) => post.slug === slug) ?? null,
  };
});

import { routeConfig } from "../../src/routes/route-config";

const COVER = {
  url: "https://store.public.blob.vercel-storage.com/photos/cover.png",
  width: 640,
  height: 420,
};

const NAPKIN = {
  slug: "napkin-ai-presentations",
  order: 1,
  title: "প্রেজেন্টেশন তৈরির সমাধান ন্যাপকিন - Napkin",
  excerpt: "আজকে আমরা জানবো ন্যাপকিন সম্পর্কে।",
  body: "আজকে আমরা জানবো **ন্যাপকিন** সম্পর্কে।\n\nPrevious: [part one](/writing/javascript-introduction)\n\n```\nnode first.js\n```",
  tags: ["এআই", "টুলস"],
  status: "published",
  publishedAt: "2025-08-25",
  cover: COVER,
  coverAlt: "Napkin's home page",
};

const INTRO = {
  slug: "javascript-introduction",
  order: 0,
  title: "JavaScript introduction",
  excerpt: "Starting a JavaScript series.",
  body: "Why JavaScript.",
  tags: ["JavaScript"],
  status: "published",
  publishedAt: "2025-09-12",
};

/** Titles of the post cards, in page order. */
function postTitles() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("href").startsWith("/writing/"))
    .map((link) => link.textContent);
}

function renderAt(path) {
  const router = createMemoryRouter(routeConfig, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  store.posts = [NAPKIN, INTRO];
});

describe("WritingPage", () => {
  it("lists posts newest first, linking to their pages on this site", async () => {
    renderAt("/writing");
    expect(await screen.findAllByRole("heading", { level: 1 })).toHaveLength(1);

    expect(postTitles()).toEqual([INTRO.title, NAPKIN.title]);

    const link = screen.getByRole("link", { name: NAPKIN.title });
    expect(link).toHaveAttribute("href", "/writing/napkin-ai-presentations");
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAttribute("lang", "bn");

    const card = link.closest("article");
    expect(within(card).getByText("August 25, 2025")).toHaveAttribute(
      "datetime",
      "2025-08-25",
    );
    expect(screen.queryByText(/Blogger/)).toBeNull();
  });

  it("filters by tag", async () => {
    const user = userEvent.setup();
    renderAt("/writing");
    const filters = await screen.findByRole("group", { name: "Filter by tag" });
    await user.click(
      within(filters).getByRole("button", { name: "JavaScript" }),
    );
    expect(postTitles()).toEqual([INTRO.title]);
    expect(
      within(filters).getByRole("button", { name: "JavaScript" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an empty state when nothing is published", async () => {
    store.posts = [];
    renderAt("/writing");
    expect(await screen.findByText(/No posts yet/)).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Filter by tag" })).toBeNull();
  });
});

describe("PostPage", () => {
  it("renders the post with its cover, Markdown body, and internal links", async () => {
    renderAt("/writing/napkin-ai-presentations");
    const title = await screen.findByRole("heading", { level: 1 });
    expect(title).toHaveTextContent(NAPKIN.title);
    expect(title.closest("article")).toHaveAttribute("lang", "bn");

    const cover = screen.getByRole("img", { name: "Napkin's home page" });
    expect(cover).toHaveAttribute("width", "640");
    expect(screen.getByText("ন্যাপকিন").tagName).toBe("STRONG");
    expect(screen.getByText("node first.js").closest("pre")).not.toBeNull();
    expect(screen.getByRole("link", { name: "part one" })).toHaveAttribute(
      "href",
      "/writing/javascript-introduction",
    );
    await waitFor(() =>
      expect(document.title).toBe(`${NAPKIN.title} — Jahid Hasan`),
    );
  });

  it("doesn't repeat a cover that also appears in the text", async () => {
    store.posts = [
      {
        ...INTRO,
        cover: COVER,
        coverAlt: "Series cover",
        body: `Intro.

![](${COVER.url})`,
      },
    ];
    renderAt("/writing/javascript-introduction");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("img", { name: "Series cover" })).toBeNull();
    expect(document.querySelectorAll(`img[src="${COVER.url}"]`)).toHaveLength(
      1,
    );
  });

  it("says when a post doesn't exist, and keeps it out of search", async () => {
    renderAt("/writing/missing");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Post not found" }),
    ).toBeInTheDocument();
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        .getAttribute("content"),
    ).toBe("noindex, follow");
  });
});
