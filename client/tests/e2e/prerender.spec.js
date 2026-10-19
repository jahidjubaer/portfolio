import { expect, test } from "@playwright/test";

// What a link-preview crawler sees: the raw HTML, without running scripts.
test("each public route ships its own head tags", async ({ request }) => {
  const sarabo = await (await request.get("/work/sarabo")).text();
  expect(sarabo).toContain("<title>Sarabo — Case study — Jahid Hasan</title>");
  expect(sarabo).toMatch(
    /<link rel="canonical" href="[^"]+\/work\/sarabo" \/>/,
  );
  expect(sarabo).toContain('<meta property="og:type" content="article" />');

  const contact = await (await request.get("/contact")).text();
  expect(contact).toContain("<title>Contact — Jahid Hasan</title>");
});

test("prerendered routes still run as the app", async ({ page }) => {
  await page.goto("/work/sarabo");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sarabo");
  await expect(page).toHaveTitle("Sarabo — Case study — Jahid Hasan");
});
