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

// Every page's link preview is a real image: its own card, a post
// cover, or the share image on the home page.
test("each public route's og:image loads", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  expect(paths.length).toBeGreaterThan(5);
  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const image = html.match(/<meta property="og:image" content="([^"]+)"/)[1];
    const { pathname, host } = new URL(image);
    // Off-site images (uploaded covers) aren't fetched in the test.
    if (!host.startsWith("localhost")) continue;
    const response = await request.get(pathname);
    expect(response.status(), `${path} → ${pathname}`).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  const sarabo = await (await request.get("/work/sarabo")).text();
  expect(sarabo).toContain("/og/work/sarabo.png");
});

test("prerendered routes still run as the app", async ({ page }) => {
  await page.goto("/work/sarabo");
  // Hydrating keeps the page's own preview card in the head.
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og\/work\/sarabo\.png$/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sarabo");
  await expect(page).toHaveTitle("Sarabo — Case study — Jahid Hasan");
});
