import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The profile banner's shutter (docs/14 R6).
const shoot = (page) =>
  page.getByRole("button", { name: "Shoot a project or technology" });
const prints = (page) => page.locator("[data-banner-prints] > article");

test("a mouse click shoots the light the reticle caught", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  // Let the opening focus pull finish.
  await page.waitForTimeout(1500);
  const banner = page.locator("canvas").first();
  const box = await banner.boundingBox();

  // Sweep the pointer until the reticle catches an item and names it.
  let caught = "";
  for (let x = 0.05; x < 0.95 && !caught; x += 0.03) {
    for (let y = 0.15; y < 0.9 && !caught; y += 0.08) {
      await page.mouse.move(box.x + x * box.width, box.y + y * box.height);
      caught = await page.evaluate(() => {
        const label = document.querySelector("[data-shutter-label]");
        return label.style.opacity === "1" ? label.textContent : "";
      });
    }
  }
  expect(caught).not.toBe("");
  await page.mouse.down();
  await page.mouse.up();
  await expect(
    page.getByRole("article", { name: `Print: ${caught}` }),
  ).toBeVisible();
});

test("on a phone, Shoot prints beside the portrait without covering it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  await shoot(page).click();
  await expect(prints(page)).toHaveCount(1);

  const print = await prints(page).first().boundingBox();
  const portrait = await page
    .getByRole("img", { name: /^Portrait of/ })
    .boundingBox();
  const overlaps =
    print.x < portrait.x + portrait.width &&
    portrait.x < print.x + print.width &&
    print.y < portrait.y + portrait.height &&
    portrait.y < print.y + print.height;
  expect(overlaps).toBe(false);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  ).toBe(false);

  const results = await new AxeBuilder({ page }).include("body").analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact),
    ),
  ).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(prints(page)).toHaveCount(0);
  await expect(shoot(page)).toBeFocused();
});
