import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { withDefaultSettings } from "../../../server/src/schemas/settings-defaults.js";
import { homeMeta, shareImage, PAGE_META } from "../../src/routes/route-meta";
import { renderHeadTags } from "../../scripts/prerender.js";

/** Loads a module with data/settings replaced by these settings. */
async function withSettings(overrides, modulePath) {
  vi.resetModules();
  vi.doMock("../../src/data/settings", async (importOriginal) => {
    const original = await importOriginal();
    const siteSettings = withDefaultSettings(overrides);
    return {
      ...original,
      siteSettings,
      navSetting: (path, label) => {
        const id = path.slice(1);
        return siteSettings.navigation[id] ?? { label, visible: true };
      },
    };
  });
  return import(modulePath);
}

afterEach(() => {
  vi.doUnmock("../../src/data/settings");
  vi.resetModules();
});

describe("site settings on the public site", () => {
  it("orders and hides profile sections", async () => {
    const { ResumeTab } = await withSettings(
      {
        profileSections: [
          { id: "skills", visible: true },
          { id: "about", visible: true },
          { id: "open-to", visible: false },
        ],
      },
      "../../src/features/profile/ResumeTab",
    );
    render(
      <MemoryRouter>
        <ResumeTab />
      </MemoryRouter>,
    );
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings.slice(0, 2)).toEqual(["Skills", "About"]);
    expect(headings).not.toContain("Open to");
    // Sections a saved list didn't mention still show, after the rest.
    expect(headings).toContain("Experience & leadership");
  });

  it("renames and hides pages in the menus", async () => {
    const { PRIMARY_NAV, SECONDARY_NAV } = await withSettings(
      {
        navigation: {
          beyond: { label: "Life", visible: true },
          writing: { label: "Writing", visible: false },
        },
      },
      "../../src/config/navigation",
    );
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Profile",
      "Projects",
      "Life",
      "Contact",
    ]);
    expect(SECONDARY_NAV.map((item) => item.to)).not.toContain("/writing");
  });

  it("can hide the availability badge", async () => {
    const { ProfileIntro } = await withSettings(
      { openToWorkBadge: false },
      "../../src/features/profile/ProfileIntro",
    );
    render(
      <MemoryRouter>
        <ProfileIntro />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Open to new roles")).toBeNull();
  });

  it("can switch the opening animation off", async () => {
    window.sessionStorage.clear();
    const { OpeningCurtain } = await withSettings(
      { intro: { enabled: false } },
      "../../src/features/intro/OpeningCurtain",
    );
    render(<OpeningCurtain />);
    expect(screen.queryByTestId("opening-curtain")).toBeNull();
  });
});

describe("SEO settings", () => {
  const image = {
    url: "https://store.public.blob.vercel-storage.com/images/og-x.png",
    width: 1600,
    height: 840,
  };

  it("use the custom home description and share image", () => {
    expect(homeMeta({ homeDescription: "Custom." }).description).toBe(
      "Custom.",
    );
    expect(homeMeta(undefined)).toBe(PAGE_META["/"]);
    expect(shareImage({ shareImage: image })).toBe(image);
    expect(shareImage(undefined).url).toBe("/assets/og/og-default.png");
  });

  it("put an uploaded image in the prerendered head as is", () => {
    const head = renderHeadTags(
      { path: "/", ...PAGE_META["/"] },
      "https://example.com",
      image,
    );
    expect(head).toContain(
      `<meta property="og:image" content="${image.url}" />`,
    );
    expect(head).toContain('<meta property="og:image:width" content="1600" />');
    const fallback = renderHeadTags(
      { path: "/", ...PAGE_META["/"] },
      "https://example.com",
    );
    expect(fallback).toContain(
      'content="https://example.com/assets/og/og-default.png"',
    );
  });
});
