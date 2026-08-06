import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", heading: "I build clear interfaces for real product problems." },
  { path: "/work", heading: "Projects I've built" },
  { path: "/about", heading: "About Jahid" },
  { path: "/beyond", heading: "Beyond the code" },
  { path: "/contact", heading: "Get in touch" },
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

test("navigation to Work works", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Work" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects I've built" }),
  ).toBeVisible();
});

test("navigation to About works", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "About" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();
});

test("navigation to Beyond works", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Beyond" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Beyond the code" }),
  ).toBeVisible();
});

test("navigation to Contact works", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Get in touch" }),
  ).toBeVisible();
});

test("browser back/forward works between routes", async ({ page }) => {
  await page.goto("/");
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "I build clear interfaces for real product problems.",
    }),
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

test("mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();

  const mobileNav = page.getByRole("navigation", { name: "Mobile" });
  await expect(mobileNav).toBeVisible();

  await mobileNav.getByRole("link", { name: "About" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();
  await expect(mobileNav).toBeHidden();
});
