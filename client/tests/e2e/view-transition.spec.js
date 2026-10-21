import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const content = JSON.parse(
  readFileSync(new URL("../../src/generated/content.json", import.meta.url)),
);

// Records the view-transition-name of every element the browser captures,
// so the test can check the card cover and the hero cover share a name.
async function watchViewTransitions(page) {
  await page.addInitScript(() => {
    window.__viewTransitions = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = (update) => {
      const names = () =>
        [...document.querySelectorAll("*")]
          .map((el) => getComputedStyle(el).viewTransitionName)
          .filter((name) => name && name !== "none" && name !== "root");
      const record = { before: names(), after: [], done: false };
      window.__viewTransitions.push(record);
      const transition = start(async () => {
        await update();
        record.after = names();
      });
      transition.finished.finally(() => {
        record.done = true;
      });
      return transition;
    };
  });
}

test("a project card morphs into its case-study hero and back", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  // Vercel Analytics only exists on Vercel, not in the local preview.
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
  );
  await watchViewTransitions(page);
  await page.goto("/work");

  const card = page.getByRole("link", { name: "Sarabo", exact: true });
  await card.click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Sarabo" }),
  ).toBeVisible();

  const [forward] = await page.evaluate(() => window.__viewTransitions);
  expect(forward.before).toEqual(["project-cover-sarabo"]);
  expect(forward.after).toEqual(["project-cover-sarabo"]);

  // The hero must be fully visible once the transition ends (no Reveal
  // left at opacity 0).
  await page.waitForFunction(() => window.__viewTransitions[0].done);
  const heroOpacity = await page
    .getByRole("heading", { level: 1, name: "Sarabo" })
    .evaluate((el) => {
      let opacity = 1;
      for (let node = el; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      return opacity;
    });
  expect(heroOpacity).toBe(1);

  await page.goBack();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
  const transitions = await page.evaluate(() => window.__viewTransitions);
  expect(transitions).toHaveLength(2);
  expect(transitions[1].after).toEqual(["project-cover-sarabo"]);

  expect(errors).toEqual([]);
});

test("a new page starts at the top and Back returns to where you were", async ({
  page,
}) => {
  await page.goto("/work");
  const cards = page.locator("article h2 a, article h3 a");
  const last = cards.last();
  await last.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);

  await last.click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.goBack();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeCloseTo(before, -1);
});

test("a photo zooms out of its frame into the viewer and back", async ({
  page,
}) => {
  await watchViewTransitions(page);
  await page.route("**/_vercel/insights/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
  );
  await page.goto("/beyond");
  test.skip(content.photos.length === 0, "No photos published.");
  await expect(page.locator("[data-photo-id]").first()).toBeVisible();

  const frame = page.getByRole("listitem").getByRole("button").first();
  await frame.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForFunction(() => window.__viewTransitions[0]?.done);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.waitForFunction(() => window.__viewTransitions[1]?.done);
  await expect(frame).toBeFocused();

  const [open, close] = await page.evaluate(() => window.__viewTransitions);
  expect(open).toMatchObject({
    before: ["photo-zoom"],
    after: ["photo-zoom"],
  });
  expect(close).toMatchObject({
    before: ["photo-zoom"],
    after: ["photo-zoom"],
  });
  // Afterwards nothing keeps the name, ready for the next photo.
  const left = await page.evaluate(() =>
    [...document.querySelectorAll("[data-photo-id], [data-photo-viewer]")]
      .map((el) => getComputedStyle(el).viewTransitionName)
      .filter((name) => name !== "none"),
  );
  expect(left).toEqual([]);
});
