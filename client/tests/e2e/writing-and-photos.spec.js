import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { withDefaultSettings } from "../../../server/src/schemas/settings-defaults.js";

// Posts and photos are in the published snapshot the build reads (R8:
// imported from Blogger, edited in the admin). Nothing is fetched at
// runtime, so these run against whatever the snapshot holds.
const content = JSON.parse(
  readFileSync(new URL("../../src/generated/content.json", import.meta.url)),
);
const { showcase } = withDefaultSettings(content.settings);
const newestPost = [...content.posts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
)[0];

async function expectNoSeriousA11yIssues(page) {
  const results = await new AxeBuilder({ page }).include("body").analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact),
    ),
  ).toEqual([]);
}

async function expectNoHorizontalOverflow(page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
}

test("Writing lists the published posts, linking to pages on this site", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("complementary", { name: "Sidebar" })
    .getByRole("link", { name: "Writing" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Blog / Learning" }),
  ).toBeVisible();

  if (!newestPost) {
    await expect(page.getByText(/No posts yet/)).toBeVisible();
    return;
  }
  const link = page.getByRole("link", { name: newestPost.title, exact: true });
  await expect(link).toHaveAttribute("href", `/writing/${newestPost.slug}`);
  await expect(page.getByText(/Blogger/)).toHaveCount(0);
  await expectNoSeriousA11yIssues(page);
});

test("a post page renders on a phone without overflow", async ({ page }) => {
  test.skip(!newestPost, "No published posts in the snapshot.");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/writing/${newestPost.slug}`);
  await expect(
    page.getByRole("heading", { level: 1, name: newestPost.title }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expectNoSeriousA11yIssues(page);
});

test("a post's prerendered HTML has its own title and canonical", async ({
  request,
}) => {
  test.skip(!newestPost, "No published posts in the snapshot.");
  const html = await (await request.get(`/writing/${newestPost.slug}`)).text();
  expect(html).toContain(`<link rel="canonical"`);
  expect(html).toContain(`/writing/${newestPost.slug}"`);
  expect(html).toContain('property="og:type" content="article"');
});

test("the Beyond gallery opens photos in an accessible viewer", async ({
  page,
}) => {
  await page.goto("/beyond");
  if (content.photos.length === 0) {
    await expect(
      page.getByText("A curated photography selection is being prepared."),
    ).toBeVisible();
    return;
  }
  // A sample of the photos, then a card to the full photo journal.
  const shown = Math.min(content.photos.length, showcase.photos.limit);
  await expect(
    page.getByText(`${shown} photograph${shown === 1 ? "" : "s"}`),
  ).toBeVisible();
  if (showcase.photos.siteUrl) {
    await expect(
      page.getByRole("link", { name: /See everything on/ }),
    ).toHaveAttribute("href", showcase.photos.siteUrl);
  }
  await page.getByRole("listitem").getByRole("button").first().click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toBeVisible();
  await expectNoSeriousA11yIssues(page);
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});

test("the Beyond gallery fits a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/beyond");
  await expect(
    page.getByRole("heading", { level: 2, name: "Photography Showcase" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
