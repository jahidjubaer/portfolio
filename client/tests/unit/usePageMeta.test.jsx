import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { usePageMeta } from "../../src/hooks/usePageMeta";

function Probe(props) {
  usePageMeta(props);
  return null;
}

function meta(selector) {
  return document.head.querySelector(selector)?.getAttribute("content") ?? null;
}

describe("usePageMeta", () => {
  it("sets title, description, canonical, OG, Twitter, and robots", () => {
    render(
      <Probe
        title="Contact — Jahid Hasan"
        description="Reach out."
        path="/contact"
      />,
    );

    expect(document.title).toBe("Contact — Jahid Hasan");
    expect(meta('meta[name="description"]')).toBe("Reach out.");
    expect(
      document.head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href"),
    ).toBe("http://localhost:5173/contact");
    expect(meta('meta[property="og:title"]')).toBe("Contact — Jahid Hasan");
    expect(meta('meta[property="og:url"]')).toBe(
      "http://localhost:5173/contact",
    );
    expect(meta('meta[property="og:image"]')).toBe(
      "http://localhost:5173/assets/og/og-default.svg",
    );
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(meta('meta[name="robots"]')).toBe("index, follow");
  });

  it("honors an explicit robots directive for noindex routes", () => {
    render(
      <Probe
        title="Page not found"
        description="Missing."
        path="/nope"
        robots="noindex, follow"
      />,
    );
    expect(meta('meta[name="robots"]')).toBe("noindex, follow");
  });

  it("restores the previous title after unmount", () => {
    document.title = "Original";
    const { unmount } = render(
      <Probe title="Temporary" description="x" path="/" />,
    );
    expect(document.title).toBe("Temporary");
    unmount();
    expect(document.title).toBe("Original");
  });
});
