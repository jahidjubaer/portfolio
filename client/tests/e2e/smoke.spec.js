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

test("mobile menu opens and closes via its toggle button", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  const closeToggle = page.getByRole("button", { name: "Close menu" });
  await expect(closeToggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

  await closeToggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("Escape closes the mobile menu and returns focus to the toggle", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("active route indicator updates as navigation changes", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });

  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await nav.getByRole("link", { name: "Work" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects I've built" }),
  ).toBeVisible();
  await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("focus remains visible when tabbing through primary navigation", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // JH. monogram / home link

  const activeElement = page.locator(":focus");
  await expect(activeElement).toBeVisible();
  const outlineStyle = await activeElement.evaluate(
    (el) => getComputedStyle(el).outlineStyle,
  );
  expect(outlineStyle).not.toBe("none");
});

test("/beyond uses the STORY identity", async ({ page }) => {
  await page.goto("/beyond");
  await expect(page.locator("html")).toHaveAttribute("data-identity", "story");
});

test("professional routes use the SYSTEM identity", async ({ page }) => {
  for (const path of ["/", "/work", "/about", "/contact", "/resume"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute(
      "data-identity",
      "system",
    );
  }
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
  await page.goto("/work/bang-learner");
  await expect(
    page.getByRole("heading", { level: 1, name: "Bang Learner" }),
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
    page.getByRole("heading", { level: 1, name: "Projects I've built" }),
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

  await sectionNav.getByRole("link", { name: "Architecture" }).click();
  await expect(page).toHaveURL(/#architecture$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Architecture" }),
  ).toBeInViewport();
});

test("no horizontal overflow on the Sarabo case study at 360px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/work/sarabo");

  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("reduced-motion mode still renders and navigates correctly", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "I build clear interfaces for real product problems.",
    }),
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Work" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Projects I've built" }),
  ).toBeVisible();
});

test("no horizontal overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});

test("unknown route provides working recovery navigation", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await page.getByRole("link", { name: "Return home" }).click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "I build clear interfaces for real product problems.",
    }),
  ).toBeVisible();
});

for (const path of ["/about", "/work", "/resume", "/beyond"]) {
  test(`no horizontal overflow on ${path} at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);

    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });
}

test("About page portrait renders visibly on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about");

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
  await expect(page.getByRole("link", { name: "Sarabo" })).toBeVisible();
});

test("Résumé download action is visible on a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/resume");

  const downloadLink = page.getByRole("link", { name: /download résumé/i });
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
    page.getByRole("heading", { level: 2, name: "Leadership" }),
  ).toBeVisible();
  await expect(
    page.getByText("A curated photography selection is being prepared."),
  ).toBeVisible();
});
