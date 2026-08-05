import { expect, test } from "@playwright/test";

// Nested static routes are requested with a trailing slash. The local
// `vite preview` static server resolves clean, trailing-slash-less URLs
// (e.g. `/about`) to the SPA fallback shell instead of the pre-rendered
// `about/index.html`, which is a known limitation of `vite preview`'s static
// middleware, not of the application. Real static hosting (Vercel, Phase 11)
// resolves clean URLs to nested `index.html` files natively; this will be
// re-verified against the production host during Phase 11.
const staticRoutes: Array<{ path: string; heading: RegExp }> = [
  { path: "/", heading: /portfolio foundation/i },
  { path: "/work/", heading: /selected work/i },
  { path: "/about/", heading: /about jahid/i },
  { path: "/beyond/", heading: /beyond the code/i },
  { path: "/contact/", heading: /contact/i },
  { path: "/resume/", heading: /résumé/i },
];

for (const { path, heading } of staticRoutes) {
  test(`${path} loads with a single visible h1`, async ({ page }) => {
    await page.goto(path);
    const headings = page.getByRole("heading", { level: 1 });
    await expect(headings).toHaveCount(1);
    await expect(headings.first()).toHaveText(heading);
  });
}

test("unknown route renders the not-found page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(
    page.getByRole("heading", { level: 1, name: /page not found/i }),
  ).toBeVisible();
});

test("direct navigation and refresh on a non-home route both work", async ({
  page,
}) => {
  await page.goto("/about/");
  await expect(
    page.getByRole("heading", { level: 1, name: /about jahid/i }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: /about jahid/i }),
  ).toBeVisible();
});
