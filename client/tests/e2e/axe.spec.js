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

for (const path of STATIC_ROUTES) {
  test(`${path} has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("known project route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/work/sarabo");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("known incomplete project route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/work/bang-learner");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("Note Bank project overview route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/work/note-bank");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("unknown project route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/work/unknown-project");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("unknown route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/this-route-does-not-exist");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("open mobile menu has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
