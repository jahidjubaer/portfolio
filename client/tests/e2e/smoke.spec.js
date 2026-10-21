import { test, expect } from "@playwright/test";

const routes = [
  { path: "/", heading: "Jahid Hasan" },
  { path: "/work", heading: "Projects" },
  { path: "/writing", heading: "Blog / Learning" },
  { path: "/learning", heading: "Learning" },
  { path: "/credentials", heading: "Education & Certifications" },
  { path: "/beyond", heading: "Beyond the code" },
  { path: "/contact", heading: "Contact" },
  { path: "/resume", heading: "Jahid Hasan" },
];

function sidebar(page) {
  return page.getByRole("complementary", { name: "Sidebar" });
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

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

test("/about redirects to the profile", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Jahid Hasan" }),
  ).toBeVisible();
});

test("/blog redirects to /writing", async ({ page }) => {
  await page.goto("/blog");
  await expect(page).toHaveURL(/\/writing$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Blog / Learning" }),
  ).toBeVisible();
});

test("sidebar navigation reaches every primary route", async ({ page }) => {
  await page.goto("/");
  for (const [label, heading] of [
    ["Projects", "Projects"],
    ["Beyond", "Beyond the code"],
    ["Contact", "Contact"],
    ["Writing", "Blog / Learning"],
    ["Learning", "Learning"],
    ["Credentials", "Education & Certifications"],
    ["Profile", "Jahid Hasan"],
  ]) {
    await sidebar(page).getByRole("link", { name: label, exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
  }
});

test("active route indicator updates as navigation changes", async ({
  page,
}) => {
  await page.goto("/");
  const nav = sidebar(page);
  await expect(
    nav.getByRole("link", { name: "Profile", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Projects" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
  await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    nav.getByRole("link", { name: "Profile", exact: true }),
  ).not.toHaveAttribute("aria-current", "page");
});

test("profile tabs switch panels and keep the tab in the URL", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Work" }).click();
  await expect(page).toHaveURL(/\?tab=work$/);
  await expect(
    page.getByRole("link", { name: "Sarabo", exact: true }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByRole("tab", { name: "Work" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("theme choice persists across a reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const initial = await html.getAttribute("data-theme");
  const next = initial === "dark" ? "light" : "dark";

  await sidebar(page)
    .getByRole("button", { name: /switch to (light|dark) mode/i })
    .click();
  await expect(html).toHaveAttribute("data-theme", next);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", next);
});

test("browser back/forward works between routes", async ({ page }) => {
  await page.goto("/");
  await page.goto("/work");
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByRole("heading", { level: 1, name: "Jahid Hasan" }),
  ).toBeVisible();

  await page.goForward();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
});

test("direct navigation (refresh) on a non-home route works", async ({
  page,
}) => {
  await page.goto("/work");
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
});

test("mobile bottom navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const bottomNav = page.getByRole("navigation", { name: "Main" });
  await expect(bottomNav).toBeVisible();
  await bottomNav.getByRole("link", { name: "Projects" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
  await expect(
    bottomNav.getByRole("link", { name: "Projects" }),
  ).toHaveAttribute("aria-current", "page");
});

test("mobile More sheet reaches every other page and closes cleanly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const bottomNav = page.getByRole("navigation", { name: "Main" });
  const more = bottomNav.getByRole("button", { name: "More" });

  await more.click();
  const sheet = page.getByRole("dialog", { name: "More" });
  await expect(sheet).toBeVisible();
  for (const name of ["Beyond", "Learning", "Credentials", "Resume"]) {
    await expect(sheet.getByRole("link", { name })).toBeVisible();
  }

  // Escape closes it and focus returns to the More tab.
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(more).toBeFocused();

  await more.click();
  await sheet.getByRole("link", { name: "Learning" }).click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/\/learning$/);
});

test("back to top appears after scrolling and returns to the H1", async ({
  page,
}) => {
  await page.goto("/work/sarabo");
  const button = page.getByRole("button", { name: "Back to top" });
  await expect(button).toBeHidden();
  // Retried: the opening animation can hold the page still for a moment.
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(button).toBeVisible({ timeout: 500 });
  }).toPass();
  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("#main-content h1")).toBeFocused();
});

test("appearance menu works on mobile (theme, accent, font)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Customize appearance" }).click();
  await expect(page.getByRole("switch", { name: "UI sounds" })).toBeVisible();

  await page.getByRole("radio", { name: "Paper" }).check();
  await page.getByTitle("Sky").click();
  await page.getByText("Space Grotesk", { exact: true }).click();
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(html).toHaveAttribute("data-accent", "sky");
  await expect(html).toHaveAttribute("data-font", "grotesk");

  // Survives a reload without a flash (applied by the inline script).
  await page.reload();
  await expect(html).toHaveAttribute("data-accent", "sky");
  await expect(html).toHaveAttribute("data-font", "grotesk");

  // A full theme (docs/14 R7) also survives a reload, from the first paint.
  await page.getByRole("button", { name: "Customize appearance" }).click();
  await page.locator("label").filter({ hasText: "Cyanotype" }).click();
  await expect(html).toHaveAttribute("data-scene", "cyanotype");
  await page.reload();
  await expect(html).toHaveAttribute("data-scene", "cyanotype");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-accent", "lime");
});

test("greeting popup appears and its quick reply pre-fills contact", async ({
  page,
}) => {
  await page.goto("/");
  const greeting = page.getByRole("complementary", {
    name: /message from jahid/i,
  });
  await expect(greeting).toBeVisible({ timeout: 10000 });
  await greeting.getByRole("link", { name: "I'm hiring" }).click();
  await expect(page).toHaveURL(/\/contact\?subject=Job/);
  await expect(page.getByLabel(/subject/i)).toHaveValue("Job opportunity");
});

test("focus remains visible when tabbing into the sidebar", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // brand / profile link

  const activeElement = page.locator(":focus");
  await expect(activeElement).toBeVisible();
  const outlineStyle = await activeElement.evaluate(
    (el) => getComputedStyle(el).outlineStyle,
  );
  expect(outlineStyle).not.toBe("none");
});

test("known project route renders project details", async ({ page }) => {
  await page.goto("/work/sarabo");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sarabo" }),
  ).toBeVisible();
});

test("known incomplete project route renders a preparation state", async ({
  page,
}) => {
  await page.goto("/work/bangladesh-landscape");
  await expect(
    page.getByRole("heading", { level: 1, name: "Bangladesh Landscape" }),
  ).toBeVisible();
  await expect(page.getByText(/still in preparation/)).toBeVisible();
});

test("unknown project route renders a controlled recovery state", async ({
  page,
}) => {
  await page.goto("/work/unknown-project");
  await expect(
    page.getByRole("heading", { level: 1, name: "Project not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View Work" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
});

test("project header links back to the projects index", async ({ page }) => {
  await page.goto("/work/sarabo");
  await page.getByRole("link", { name: "Back to projects" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
});

test("Sarabo case-study section navigation jumps to the target section", async ({
  page,
}) => {
  await page.goto("/work/sarabo");
  const sectionNav = page.getByRole("navigation", {
    name: "Case study sections",
  });
  await expect(sectionNav).toBeVisible();

  await sectionNav.getByRole("link", { name: "How it works" }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "How it works" }),
  ).toBeInViewport();
});

test("reduced-motion mode still renders and navigates correctly", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Jahid Hasan" }),
  ).toBeVisible();

  await sidebar(page).getByRole("link", { name: "Projects" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects" }),
  ).toBeVisible();
});

test("unknown route provides working recovery navigation", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Jahid Hasan" }),
  ).toBeVisible();
});

for (const path of [
  "/",
  "/?tab=work",
  "/work",
  "/work/sarabo",
  "/contact",
  "/resume",
  "/beyond",
  "/writing",
  "/learning",
  "/credentials",
]) {
  test(`no horizontal overflow on ${path} at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    await page.locator("h1").first().waitFor();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
}

test("profile portrait renders visibly on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: "Portrait of Jahid Hasan" }),
  ).toBeVisible();
});

test("Work page flagship project is usable on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/work");

  await expect(
    page.getByRole("heading", { level: 2, name: "Sarabo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sarabo", exact: true }),
  ).toBeVisible();
});

test("Resume download action is visible on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/resume");
  // ResumePage is lazy-loaded (see route-config.jsx) — wait past the
  // RouteLoading fallback before checking which resume state rendered.
  await page.locator("h1").first().waitFor();

  const downloadLink = page.getByRole("link", { name: /download pdf/i });
  const preparingNotice = page.getByText(/being prepared/i);
  const hasDownload = await downloadLink.isVisible().catch(() => false);
  const hasNotice = await preparingNotice.isVisible().catch(() => false);
  expect(hasDownload || hasNotice).toBe(true);
});

test("Beyond page renders its sections on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/beyond");

  await expect(
    page.getByRole("heading", { level: 2, name: "Photography" }),
  ).toBeVisible();
  await expect(
    page.getByText("What I do with a camera and a book."),
  ).toBeVisible();
});
