import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { OpeningCurtain } from "../../src/features/intro/OpeningCurtain";
import {
  HOLD_MS,
  OPENING_SEEN_KEY,
  replayOpening,
} from "../../src/features/intro/opening-state";
import { tornClipPath } from "../../src/features/intro/torn-edge";
import { PreferencesContext } from "../../src/features/preferences/preferences-context";

function renderCurtain(play = vi.fn(), style) {
  render(
    <PreferencesContext.Provider value={{ play }}>
      <OpeningCurtain style={style} />
    </PreferencesContext.Provider>,
  );
  return play;
}

function setUserActivation(hasBeenActive) {
  Object.defineProperty(navigator, "userActivation", {
    configurable: true,
    value: { hasBeenActive },
  });
}

function mockReducedMotion(reduce) {
  window.matchMedia = vi.fn((query) => ({
    matches: reduce && query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

beforeEach(() => {
  window.sessionStorage.clear();
  setUserActivation(false);
});

afterEach(() => {
  delete window.matchMedia;
});

describe("OpeningCurtain", () => {
  it("covers the page on the first visit, then opens and unmounts", async () => {
    renderCurtain();
    const curtain = screen.getByTestId("opening-curtain");
    expect(curtain).toHaveAttribute("aria-hidden", "true");
    expect(window.sessionStorage.getItem(OPENING_SEEN_KEY)).toBe("1");

    await waitFor(
      () => expect(screen.queryByTestId("opening-curtain")).toBeNull(),
      { timeout: 3000 },
    );
  });

  it("does not play again in the same session", () => {
    window.sessionStorage.setItem(OPENING_SEEN_KEY, "1");
    renderCurtain();
    expect(screen.queryByTestId("opening-curtain")).toBeNull();
  });

  it("is skipped entirely for reduced motion", () => {
    mockReducedMotion(true);
    renderCurtain();
    expect(screen.queryByTestId("opening-curtain")).toBeNull();
  });

  it("skips to the end on a key press", async () => {
    renderCurtain();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    await waitFor(() =>
      expect(screen.queryByTestId("opening-curtain")).toBeNull(),
    );
  });

  it("stays silent before the visitor has interacted", async () => {
    const play = renderCurtain();
    await new Promise((resolve) => setTimeout(resolve, HOLD_MS + 50));
    expect(play).not.toHaveBeenCalled();
  });

  it("replays on request, with sound once audio is allowed", async () => {
    window.sessionStorage.setItem(OPENING_SEEN_KEY, "1");
    const play = renderCurtain();
    setUserActivation(true);

    act(() => replayOpening());
    expect(screen.getByTestId("opening-curtain")).toBeInTheDocument();
    await waitFor(() => expect(play).toHaveBeenCalledWith("pageOpen"));
    expect(play).toHaveBeenCalledTimes(1);
  });
});

describe("tornClipPath", () => {
  it("opens as a camera aperture, with a shutter sound", async () => {
    setUserActivation(true);
    const play = renderCurtain(vi.fn(), "aperture");
    expect(screen.getByTestId("opening-curtain")).toHaveTextContent(
      "Jahid Hasan",
    );
    await waitFor(() => expect(play).toHaveBeenCalledWith("shutter"));
    await waitFor(
      () => expect(screen.queryByTestId("opening-curtain")).toBeNull(),
      { timeout: 3000 },
    );
  });

  it("gives both halves the same tear so they fit together", () => {
    const left = tornClipPath("left");
    const right = tornClipPath("right");
    const leftOffsets = [...left.matchAll(/calc\(100% - (-?[\d.]+)px\)/g)].map(
      (match) => 16 - Number(match[1]),
    );
    const rightOffsets = [...right.matchAll(/(-?[\d.]+)px [\d.]+%/g)]
      .map((match) => Number(match[1]) - 16)
      .reverse();
    expect(leftOffsets.length).toBeGreaterThan(20);
    expect(rightOffsets.map((value) => value.toFixed(1))).toEqual(
      leftOffsets.map((value) => value.toFixed(1)),
    );
  });
});
