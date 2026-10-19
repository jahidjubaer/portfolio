import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const STATIC_ROUTES = [
  "/",
  "/work",
  "/?tab=work",
  "/learning",
  "/beyond",
  "/contact",
  "/resume",
  "/admin",
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

test("ICT Crack project overview route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/work/ict-crack");
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

test("/beyond has no automatically detectable accessibility violations at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoAndWaitForContent(page, "/beyond");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/beyond photography viewer scan is skipped — no real photographs exist yet to open", async ({
  page,
}) => {
  await gotoAndWaitForContent(page, "/beyond");
  const galleryButtons = await page
    .getByRole("button", { name: /photography by Jahid Hasan/i })
    .count();
  expect(galleryButtons).toBe(0);
});

// Contrast differs per theme, so scan the light theme too. The init script
// stores the choice before the page's own theme script reads it.
for (const path of ["/", "/work", "/contact"]) {
  test(`${path} has no accessibility violations in the light theme`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
      window.localStorage.setItem("theme", "light"),
    );
    await gotoAndWaitForContent(page, path);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
