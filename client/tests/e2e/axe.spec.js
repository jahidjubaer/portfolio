import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const STATIC_ROUTES = [
  "/",
  "/work",
  "/about",
  "/beyond",
  "/contact",
  "/resume",
];

// Every secondary route is lazy-loaded (see route-config.jsx) and briefly
// shows the RouteLoading fallback while its chunk downloads. Every route —
// including error/not-found states — renders exactly one H1 once resolved,
// so waiting for it here (rather than analyzing immediately after goto)
// keeps these scans from racing the Suspense boundary.
async function gotoAndWaitForContent(page, path) {
  await page.goto(path);
  await page.locator("h1").first().waitFor();
}

for (const path of STATIC_ROUTES) {
  test(`${path} has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await gotoAndWaitForContent(page, path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("known project route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/sarabo");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("known incomplete project route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/bang-learner");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("Note Bank project overview route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/note-bank");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("unknown project route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/unknown-project");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("unknown route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/this-route-does-not-exist");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("open mobile menu has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoAndWaitForContent(page, "/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/beyond has no automatically detectable accessibility violations at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoAndWaitForContent(page, "/beyond");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// The photography viewer is a modal dialog that only mounts once a real
// photograph is clicked. No real photography assets exist yet (the page
// correctly shows its honest empty state instead), so there is nothing to
// open — this test asserts that condition rather than skipping silently,
// so the viewer-open Axe scan is added the moment real images land.
test("/beyond photography viewer scan is skipped — no real photographs exist yet to open", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/beyond");
  const galleryButtons = await page
    .getByRole("button", { name: /photography by Jahid Hasan/i })
    .count();
  expect(galleryButtons).toBe(0);
});
