import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const getLearningPosts = vi.fn();
vi.mock("../../src/lib/api", () => ({
  getLearningPosts: (...args) => getLearningPosts(...args),
}));

import { LearningPage } from "../../src/pages/LearningPage";

const POST_A = {
  id: "post-a",
  title: "Learning React Server Components",
  url: "https://jahid-notes.blogspot.com/post-a.html",
  publishedAt: "2026-01-15T10:00:00.000-08:00",
  updatedAt: "2026-01-15T10:00:00.000-08:00",
  excerpt: "A short excerpt about server components.",
  thumbnail: "https://blogger.googleusercontent.com/img/a/s640/photo.jpg",
  labels: ["React", "Notes"],
};

const POST_B = {
  id: "post-b",
  title: "Two Weeks With TypeScript",
  url: "https://jahid-notes.blogspot.com/post-b.html",
  publishedAt: "2026-02-01T10:00:00.000-08:00",
  updatedAt: null,
  excerpt: "What I learned trying TypeScript on a side project.",
  thumbnail: null,
  labels: ["TypeScript"],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <LearningPage />
    </MemoryRouter>,
  );
}

describe("LearningPage", () => {
  beforeEach(() => {
    getLearningPosts.mockReset();
  });

  it("renders the route with its single H1", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [],
    });
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Blog / Learning" }),
    ).toBeInTheDocument();
  });

  it("shows an accessible loading status before posts resolve", () => {
    getLearningPosts.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading learning notes…",
    );
  });

  it("renders posts once loaded, including date, title, excerpt, and a label", async () => {
    // A single label here (rather than POST_A's usual two) keeps this test
    // focused on card content — two-or-more *distinct* labels across the
    // post list also renders the separate label-filter row, which is
    // covered in its own tests below.
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [{ ...POST_A, labels: ["React"] }],
    });
    renderPage();

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Learning React Server Components",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A short excerpt about server components."),
    ).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    const time = screen.getByText("January 15, 2026");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", POST_A.publishedAt);
  });

  it("shows the empty state — not an error — when Blogger has zero posts", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [],
    });
    renderPage();

    expect(
      await screen.findByText("No published notes yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the configuration-missing state without developer terminology", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: false,
      posts: [],
    });
    renderPage();

    expect(
      await screen.findByText("Learning notes are being prepared."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/VITE_BLOGGER_BLOG_URL/)).not.toBeInTheDocument();
    expect(screen.queryByText(/not configured/i)).not.toBeInTheDocument();
  });

  it("shows a retryable error state on upstream failure, without exposing raw details", async () => {
    getLearningPosts.mockResolvedValue({
      success: false,
      message: "Learning posts couldn't be loaded right now.",
    });
    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Learning posts couldn't be loaded right now.",
    );
    expect(screen.queryByText(/502/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();

    const user = userEvent.setup();
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [POST_A],
    });
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Learning React Server Components",
      }),
    ).toBeInTheDocument();
    expect(getLearningPosts).toHaveBeenCalledTimes(2);
  });

  it("opens article links in a new tab with rel=noopener noreferrer", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [POST_A],
    });
    renderPage();

    const titleLink = await screen.findByRole("link", {
      name: "Learning React Server Components",
    });
    expect(titleLink).toHaveAttribute("href", POST_A.url);
    expect(titleLink).toHaveAttribute("target", "_blank");
    expect(titleLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("falls back to the learning placeholder when a post has no thumbnail", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [POST_B],
    });
    renderPage();

    await screen.findByRole("heading", { level: 2, name: POST_B.title });
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/assets/placeholders/learning-placeholder.svg",
    );
  });

  it("shows a label filter only when two or more distinct labels exist", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [POST_A, POST_B],
    });
    renderPage();

    await screen.findByRole("heading", { level: 2, name: POST_A.title });
    expect(
      screen.getByRole("group", { name: "Filter by label" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "TypeScript" }),
    ).toBeInTheDocument();
  });

  it("hides the label filter when fewer than two distinct labels exist", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [{ ...POST_A, labels: ["React"] }],
    });
    renderPage();

    await screen.findByRole("heading", { level: 2, name: POST_A.title });
    expect(
      screen.queryByRole("group", { name: "Filter by label" }),
    ).not.toBeInTheDocument();
  });

  it("filters posts by the selected label", async () => {
    getLearningPosts.mockResolvedValue({
      success: true,
      configured: true,
      posts: [POST_A, POST_B],
    });
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole("heading", { level: 2, name: POST_A.title });
    await user.click(screen.getByRole("button", { name: "TypeScript" }));

    expect(
      screen.getByRole("heading", { level: 2, name: POST_B.title }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 2, name: POST_A.title }),
      ).not.toBeInTheDocument();
    });
  });
});
