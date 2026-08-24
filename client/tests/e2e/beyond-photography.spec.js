import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Fixture photos — the E2E suite never depends on Blogger being online.
// /api/photography is intercepted directly, the same shape the real server
// route returns.
const FIXTURE_PHOTOS = [
  {
    id: "post-a-0",
    src: "https://blogger.googleusercontent.com/img/b/abc/s1600/one.jpg",
    thumbnail: "https://blogger.googleusercontent.com/img/b/abc/s500/one.jpg",
    title: "Blue sky Nature",
    alt: "Blue sky Nature",
    caption: "Blue sky Nature",
    category: "Nature",
    postUrl:
      "https://jahid-thecapturecrew.blogspot.com/2026/06/blue-sky-nature.html",
    publishedAt: "2026-06-30T12:12:12.987-07:00",
  },
  {
    id: "post-b-0",
    src: "https://blogger.googleusercontent.com/img/b/abc/s1600/two.jpg",
    thumbnail: "https://blogger.googleusercontent.com/img/b/abc/s500/two.jpg",
    title: "Street Photography",
    alt: "Street Photography",
    caption: "Street Photography",
    category: "StreetPhotography",
    postUrl:
      "https://jahid-thecapturecrew.blogspot.com/2026/06/street-photography.html",
    publishedAt: "2026-06-30T12:06:55.851-07:00",
  },
  {
    id: "post-c-0",
    src: "https://blogger.googleusercontent.com/img/b/abc/s1600/three.jpg",
    thumbnail: "https://blogger.googleusercontent.com/img/b/abc/s500/three.jpg",
    title: "রোদ্দুর বিকেলের সূর্য স্নান",
    alt: "ছবি: আমু বাগান, চুনারুঘাট, হবিগঞ্জ",
    caption: "ছবি: আমু বাগান, চুনারুঘাট, হবিগঞ্জ",
    category: "uncategorized",
    postUrl: "https://jahid-thecapturecrew.blogspot.com/2024/11/blog-post.html",
    publishedAt: "2024-11-15T16:57:00.000-08:00",
  },
];

async function mockPhotography(page, body) {
  await page.route("**/api/photography", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test("renders the fixture photos as a gallery with a category filter", async ({
  page,
}) => {
  await mockPhotography(page, {
    success: true,
    configured: true,
    photos: FIXTURE_PHOTOS,
    source: "Blogger",
  });

  await page.goto("/beyond");
  await expect(
    page.getByRole("img", { name: "Blue sky Nature" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Filter photography by category" }),
  ).toBeVisible();
});

test("opens the viewer, shows a Bengali caption with lang=bn, and links to the original Blogger post", async ({
  page,
}) => {
  await mockPhotography(page, {
    success: true,
    configured: true,
    photos: FIXTURE_PHOTOS,
    source: "Blogger",
  });

  await page.goto("/beyond");
  await page
    .getByRole("img", { name: "ছবি: আমু বাগান, চুনারুঘাট, হবিগঞ্জ" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const caption = dialog.getByText("ছবি: আমু বাগান, চুনারুঘাট, হবিগঞ্জ");
  await expect(caption).toBeVisible();
  await expect(caption).toHaveAttribute("lang", "bn");

  const originalPostLink = dialog.getByRole("link", {
    name: /view original post/i,
  });
  await expect(originalPostLink).toHaveAttribute(
    "href",
    FIXTURE_PHOTOS[2].postUrl,
  );
  await expect(originalPostLink).toHaveAttribute("target", "_blank");
  await expect(originalPostLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("includes the restrained archive link out to Blogger", async ({
  page,
}) => {
  await mockPhotography(page, {
    success: true,
    configured: true,
    photos: FIXTURE_PHOTOS,
    source: "Blogger",
  });

  await page.goto("/beyond");
  const archiveLink = page.getByRole("link", {
    name: /view photography archive/i,
  });
  await expect(archiveLink).toBeVisible();
  await expect(archiveLink).toHaveAttribute("target", "_blank");
  await expect(archiveLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("mobile layout renders the photography grid without overflow", async ({
  page,
}) => {
  await mockPhotography(page, {
    success: true,
    configured: true,
    photos: FIXTURE_PHOTOS,
    source: "Blogger",
  });
  await page.setViewportSize({ width: 360, height: 800 });

  await page.goto("/beyond");
  await expect(
    page.getByRole("img", { name: "Blue sky Nature" }),
  ).toBeVisible();

  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("has no automatically detectable accessibility violations with photos loaded", async ({
  page,
}) => {
  await mockPhotography(page, {
    success: true,
    configured: true,
    photos: FIXTURE_PHOTOS,
    source: "Blogger",
  });

  await page.goto("/beyond");
  await expect(
    page.getByRole("img", { name: "Blue sky Nature" }),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact),
  );
  expect(seriousOrCritical).toEqual([]);
});
