import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Fixture posts — the E2E suite never depends on Blogger being online.
// /api/blog/posts is intercepted directly, the same shape the real server
// route returns.
const FIXTURE_POSTS = [
  {
    id: "post-a",
    title: "Learning React Server Components",
    url: "https://jahid-notes.blogspot.com/post-a.html",
    publishedAt: "2026-01-15T10:00:00.000-08:00",
    updatedAt: "2026-01-15T10:00:00.000-08:00",
    excerpt: "A short excerpt about server components.",
    thumbnail: "https://blogger.googleusercontent.com/img/a/s640/photo.jpg",
    labels: ["React", "Notes"],
  },
  {
    id: "post-b",
    title: "Two Weeks With TypeScript",
    url: "https://jahid-notes.blogspot.com/post-b.html",
    publishedAt: "2026-02-01T10:00:00.000-08:00",
    updatedAt: null,
    excerpt: "What I learned trying TypeScript on a side project.",
    thumbnail: null,
    labels: ["TypeScript"],
  },
  {
    id: "post-c",
    title: "Debugging a Flaky CI Pipeline",
    url: "https://jahid-notes.blogspot.com/post-c.html",
    publishedAt: "2026-02-10T10:00:00.000-08:00",
    updatedAt: null,
    excerpt: "Notes from tracking down a race condition in CI.",
    thumbnail: null,
    labels: ["Notes"],
  },
];

async function mockLearningPosts(page, body) {
  await page.route("**/api/blog/posts", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test("renders three fixture posts and links out to the real Blogger articles", async ({
  page,
}) => {
  await mockLearningPosts(page, {
    success: true,
    configured: true,
    posts: FIXTURE_POSTS,
    source: "Blogger",
  });

  await page.goto("/learning");

  for (const post of FIXTURE_POSTS) {
    await expect(
      page.getByRole("heading", { level: 2, name: post.title }),
    ).toBeVisible();
  }

  const firstReadLink = page
    .getByRole("article")
    .first()
    .getByRole("link", { name: /read article/i });
  await expect(firstReadLink).toHaveAttribute("href", FIXTURE_POSTS[0].url);
  await expect(firstReadLink).toHaveAttribute("target", "_blank");
  await expect(firstReadLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("mobile layout renders the learning grid without overflow", async ({
  page,
}) => {
  await mockLearningPosts(page, {
    success: true,
    configured: true,
    posts: FIXTURE_POSTS,
    source: "Blogger",
  });
  await page.setViewportSize({ width: 360, height: 800 });

  await page.goto("/learning");
  await expect(
    page.getByRole("heading", { level: 2, name: FIXTURE_POSTS[0].title }),
  ).toBeVisible();

  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("has no automatically detectable accessibility violations with posts loaded", async ({
  page,
}) => {
  await mockLearningPosts(page, {
    success: true,
    configured: true,
    posts: FIXTURE_POSTS,
    source: "Blogger",
  });

  await page.goto("/learning");
  await expect(
    page.getByRole("heading", { level: 2, name: FIXTURE_POSTS[0].title }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).include("body").analyze();
  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact),
  );
  expect(seriousOrCritical).toEqual([]);
});

test("navigating to Learning from the primary nav shows real posts", async ({
  page,
}) => {
  await mockLearningPosts(page, {
    success: true,
    configured: true,
    posts: FIXTURE_POSTS,
    source: "Blogger",
  });

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Learning" })
    .click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Blog / Learning" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: FIXTURE_POSTS[0].title }),
  ).toBeVisible();
});
