import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", heading: "Portfolio foundation" },
  { path: "/work", heading: "Selected work" },
  { path: "/about", heading: "About Jahid" },
  { path: "/beyond", heading: "Beyond the code" },
  { path: "/contact", heading: "Contact" },
  { path: "/resume", heading: "Résumé" },
];

for (const { path, heading } of routes) {
  test(`${path} loads and renders its H1`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
  });
}

test("unknown route renders the 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
});

test("browser back/forward works between routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByRole("heading", { level: 1, name: "Portfolio foundation" }),
  ).toBeVisible();

  await page.goForward();
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();
});

test("direct navigation (refresh) on a non-home route works", async ({
  page,
}) => {
  await page.goto("/about");
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();
});
