import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../../src/features/preferences/PreferencesProvider";
import { AppearanceMenu } from "../../src/components/layout/AppearanceMenu";
import { seasonOn } from "../../src/features/preferences/seasons";

function renderMenu() {
  return render(
    <PreferencesProvider>
      <AppearanceMenu />
    </PreferencesProvider>,
  );
}

const root = document.documentElement;

afterEach(() => {
  window.localStorage.clear();
  for (const name of ["data-theme", "data-scene", "data-accent", "data-font"]) {
    root.removeAttribute(name);
  }
});

describe("AppearanceMenu", () => {
  it("defaults to the lime accent and Geist font", () => {
    renderMenu();
    expect(root.getAttribute("data-accent")).toBe("lime");
    expect(root.getAttribute("data-font")).toBe("geist");
  });

  it("opens, applies an accent and a font, and remembers them", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", {
      name: "Customize appearance",
    });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("radio", { name: "Sky" }));
    await user.click(screen.getByRole("radio", { name: "Inter" }));

    expect(root.getAttribute("data-accent")).toBe("sky");
    expect(root.getAttribute("data-font")).toBe("inter");
    expect(window.localStorage.getItem("accent")).toBe("sky");
    expect(window.localStorage.getItem("font")).toBe("inter");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(root.getAttribute("data-accent")).toBe("lime");
    expect(root.getAttribute("data-font")).toBe("geist");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", {
      name: "Customize appearance",
    });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("ignores an unknown stored accent", () => {
    window.localStorage.setItem("accent", "neon");
    renderMenu();
    expect(root.getAttribute("data-accent")).toBe("lime");
  });

  it("switches to a full theme, which sets its own base and accent", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("accent", "sky");
    window.localStorage.setItem("theme", "light");
    renderMenu();
    await user.click(
      screen.getByRole("button", { name: "Customize appearance" }),
    );
    expect(screen.getByRole("radio", { name: "Paper" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Darkroom" }));
    expect(root.getAttribute("data-scene")).toBe("darkroom");
    expect(root.getAttribute("data-theme")).toBe("dark");
    // The visitor's accent waits while a scene sets the colours.
    expect(root.getAttribute("data-accent")).toBe("lime");
    expect(window.localStorage.getItem("scene")).toBe("darkroom");
    expect(screen.queryByRole("radio", { name: "Sky" })).toBeNull();

    await user.click(screen.getByRole("radio", { name: "Golden hour" }));
    expect(root.getAttribute("data-theme")).toBe("light");

    await user.click(screen.getByRole("radio", { name: "Graphite" }));
    expect(root.hasAttribute("data-scene")).toBe(false);
    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(root.getAttribute("data-accent")).toBe("sky");
    expect(window.localStorage.getItem("scene")).toBe("none");
  });

  it("follows the calendar to today's season, or keeps a chosen one", async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(
      screen.getByRole("button", { name: "Customize appearance" }),
    );

    await user.click(screen.getByRole("radio", { name: /^This season/ }));
    expect(root.getAttribute("data-scene")).toBe(seasonOn(new Date()));
    expect(window.localStorage.getItem("scene")).toBe("season");

    await user.click(screen.getByRole("radio", { name: "Winter" }));
    expect(root.getAttribute("data-scene")).toBe("sheet");
    expect(root.getAttribute("data-theme")).toBe("light");
    expect(screen.getByRole("radio", { name: "Winter" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /^This season/ }),
    ).not.toBeChecked();
    expect(window.localStorage.getItem("scene")).toBe("sheet");

    // The season's sounds: off until turned on, only while a season is on.
    const sounds = screen.getByRole("switch", { name: "Winter sounds" });
    expect(sounds).not.toBeChecked();
    await user.click(sounds);
    expect(sounds).toBeChecked();
    expect(window.localStorage.getItem("ambience")).toBe("on");

    await user.click(screen.getByRole("radio", { name: "Graphite" }));
    expect(screen.queryByRole("switch", { name: "Winter sounds" })).toBeNull();
  });

  it("remembers a scene across visits, and ignores an unknown one", () => {
    window.localStorage.setItem("scene", "cyanotype");
    const { unmount } = renderMenu();
    expect(root.getAttribute("data-scene")).toBe("cyanotype");
    unmount();

    window.localStorage.setItem("scene", "sepia");
    renderMenu();
    expect(root.hasAttribute("data-scene")).toBe(false);
  });
});
