import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../../src/features/preferences/PreferencesProvider";
import { AmbienceToggleButton } from "../../src/components/layout/PreferenceButtons";

function renderButton() {
  return render(
    <PreferencesProvider>
      <AmbienceToggleButton />
    </PreferencesProvider>,
  );
}

afterEach(() => {
  window.localStorage.clear();
  for (const name of ["data-theme", "data-scene", "data-accent", "data-font"]) {
    document.documentElement.removeAttribute(name);
  }
});

describe("AmbienceToggleButton", () => {
  it("isn't there without a season", () => {
    window.localStorage.setItem("scene", "darkroom");
    renderButton();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("starts off, and turns the season's sounds on and off", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("scene", "barsha");
    renderButton();
    const button = screen.getByRole("button", {
      name: "Play the monsoon sounds",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAccessibleName("Stop the monsoon sounds");
    expect(window.localStorage.getItem("ambience")).toBe("on");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem("ambience")).toBe("off");
  });
});
