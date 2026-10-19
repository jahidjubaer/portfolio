import { describe, expect, it } from "vitest";
import { renderRoute } from "../../../scripts/prerender.js";

const TEMPLATE = `<html><head>
    <meta charset="UTF-8" />
    <!-- route-meta -->
    <title>Default</title>
    <!-- /route-meta -->
    <script type="module" src="/assets/index.js"></script>
  </head><body><div id="root"></div></body></html>`;

const SITE = "https://example.com";

describe("renderRoute", () => {
  const html = renderRoute(
    TEMPLATE,
    {
      path: "/work/sarabo",
      title: "Sarabo — Jahid Hasan",
      description: 'A "repair" platform <for> everyone & more.',
      type: "article",
    },
    SITE,
  );

  it("gives the route its own title, description, and canonical URL", () => {
    expect(html).toContain("<title>Sarabo — Jahid Hasan</title>");
    expect(html).not.toContain("<title>Default</title>");
    expect(html).toContain(
      '<link rel="canonical" href="https://example.com/work/sarabo" />',
    );
    expect(html).toContain(
      '<meta property="og:url" content="https://example.com/work/sarabo" />',
    );
    expect(html).toContain('<meta property="og:type" content="article" />');
    expect(html).toContain(
      '<meta name="twitter:title" content="Sarabo — Jahid Hasan" />',
    );
  });

  it("uses absolute image URLs and escapes attribute values", () => {
    expect(html).toContain(
      '<meta property="og:image" content="https://example.com/assets/og/og-default.png" />',
    );
    expect(html).toContain(
      'content="A &quot;repair&quot; platform &lt;for&gt; everyone &amp; more."',
    );
  });

  it("keeps the rest of the page and stays re-runnable", () => {
    expect(html).toContain('<script type="module" src="/assets/index.js">');
    expect(html).toContain('<div id="root"></div>');
    const again = renderRoute(
      html,
      { path: "/", title: "Home $& $1", description: "d" },
      SITE,
    );
    expect(again).toContain("<title>Home $&amp; $1</title>");
    expect(again).toContain(
      '<link rel="canonical" href="https://example.com" />',
    );
    expect(again.match(/route-meta -->/g)).toHaveLength(2);
  });

  it("gives the SPA fallback no canonical URL and noindex", () => {
    const fallback = renderRoute(
      TEMPLATE,
      { title: "Home", description: "d", robots: "noindex" },
      SITE,
    );
    expect(fallback).not.toContain("canonical");
    expect(fallback).not.toContain("og:url");
    expect(fallback).toContain('<meta name="robots" content="noindex" />');
  });

  it("refuses a template without the marker block", () => {
    expect(() => renderRoute("<html></html>", { path: "/" }, SITE)).toThrow(
      /route-meta/,
    );
  });
});
