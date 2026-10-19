import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../../src/features/preferences/PreferencesProvider";
import { AppearanceMenu } from "../../src/components/layout/AppearanceMenu";

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
  for (const name of ["data-theme", "data-accent", "data-font"]) {
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
});
