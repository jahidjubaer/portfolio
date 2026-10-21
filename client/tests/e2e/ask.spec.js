import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The API is stubbed: these tests never call Gemini.
test.beforeEach(async ({ page }) => {
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
  );
  await page.route("**/api/ask", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          answer: "Yes. Jahid used Firebase Authentication in Sarabo.",
          sources: ["/work/sarabo"],
        },
      }),
    }),
  );
});

test("a visitor asks from the command palette and follows the answer's link", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByRole("option", { name: /Ask about Jahid/ }).click();

  const dialog = page.getByRole("dialog", { name: "Ask about Jahid" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Your question")).toBeFocused();

  await dialog.getByLabel("Your question").fill("Has he used Firebase?");
  await page.keyboard.press("Enter");
  await expect(
    dialog.getByText("Yes. Jahid used Firebase Authentication in Sarabo."),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).include("body").analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact),
    ),
  ).toEqual([]);

  await dialog.getByRole("link", { name: "Sarabo" }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/work\/sarabo$/);
});

test("phones open it from the page header", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/work");
  await page.getByRole("button", { name: "Ask about Jahid" }).click();
  const dialog = page.getByRole("dialog", { name: "Ask about Jahid" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
