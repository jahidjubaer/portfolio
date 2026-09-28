import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const STATIC_ROUTES = [
  "/",
  "/work",
  "/about",
  "/learning",
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

test("Bang Learner case-study route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/bang-learner");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("Bangladesh Landscape project overview route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/bangladesh-landscape");
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

// The preview dialog embeds the project's real deployment in an iframe.
// Both tests stub that external origin so they stay deterministic and
// offline-safe, and so Axe's frame-aware scan doesn't pick up landmarks
// from a third-party page we don't control.
async function stubPreviewIframe(page) {
  await page.route(/^https?:\/\/(?!localhost)/, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><head><title>Preview stub</title></head><body><p>Stubbed live preview</p></body></html>",
    }),
  );
}

test("open project preview dialog has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await stubPreviewIframe(page);
  await gotoAndWaitForContent(page, "/");
  await page.getByRole("button", { name: "Preview" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("project preview dialog closes with Escape and returns focus to its trigger", async ({
  page,
}) => {
  await stubPreviewIframe(page);
  await gotoAndWaitForContent(page, "/");
  const trigger = page.getByRole("button", { name: "Preview" }).first();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
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
