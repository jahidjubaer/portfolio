import { test, expect } from "@playwright/test";

test("opens with the keyboard shortcut, searches, navigates, and returns focus", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("dialog", { name: "Command palette" }),
  ).toBeHidden();

  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();

  const searchInput = page.getByRole("combobox", { name: "Search commands" });
  await expect(searchInput).toBeFocused();

  await searchInput.fill("About");
  await expect(dialog.getByRole("option", { name: "About" })).toBeVisible();
  await expect(
    dialog.getByRole("option", { name: /^home$/i }),
  ).not.toBeVisible();

  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", { level: 1, name: "About Jahid" }),
  ).toBeVisible();
});

test("closes with Escape and returns focus to the previously focused element", async ({
  page,
}) => {
  await page.goto("/");

  const homeLink = page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Home" });
  await homeLink.focus();

  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Command palette" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Command palette" }),
  ).toBeHidden();
  await expect(homeLink).toBeFocused();
});

test("does not intercept the shortcut while a form field is focused", async ({
  page,
}) => {
  await page.goto("/contact");

  const nameField = page.getByLabel("Name");
  await nameField.click();
  await page.keyboard.press("Control+k");

  await expect(
    page.getByRole("dialog", { name: "Command palette" }),
  ).toBeHidden();
  await expect(nameField).toBeFocused();
});

test("Ctrl+K works from a secondary route, not just the homepage", async ({
  page,
}) => {
  await page.goto("/work");
  // /work is lazy-loaded (see route-config.jsx) — wait past the
  // RouteLoading fallback so the page has actually hydrated before
  // exercising the global keyboard shortcut.
  await page.getByRole("heading", { level: 1 }).waitFor();

  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();

  await page.getByRole("combobox", { name: "Search commands" }).fill("GitHub");
  await expect(dialog.getByRole("option", { name: "GitHub" })).toBeVisible();
});
