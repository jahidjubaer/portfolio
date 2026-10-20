import { test, expect } from "@playwright/test";

async function hasHorizontalOverflow(page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

test.beforeEach(async ({ page }) => {
  // Vercel Analytics only exists on Vercel, not in the local preview.
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
  );
});

test("Sarabo's architecture builds step by step as you scroll", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/sarabo");

  const steps = page.getByRole("list", { name: "Architecture steps" });
  await expect(steps.getByRole("button")).toHaveCount(7);

  await steps.getByRole("button", { name: /^Step 5:/ }).click();
  await expect(steps.getByRole("button", { name: /^Step 5:/ })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.getByText("Step 5 of 7")).toBeVisible();
  await expect(page.getByText("Express API → Stripe").first()).toBeVisible();

  expect(await hasHorizontalOverflow(page)).toBe(false);
  expect(errors).toEqual([]);
});

test("phones get the finished diagram and every step listed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/work/sarabo");

  const section = page.locator("#architecture");
  await expect(section.locator("ol > li")).toHaveCount(7);
  await expect(section.getByRole("button")).toHaveCount(0);
  expect(await hasHorizontalOverflow(page)).toBe(false);
});
