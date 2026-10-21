import { afterEach, describe, expect, it, vi } from "vitest";
import {
  originOf,
  switchThemeWithAperture,
} from "../../../src/features/preferences/theme-transition";
import { apertureClip, hexagonPolygon } from "../../../src/lib/aperture";

afterEach(() => {
  delete document.startViewTransition;
  vi.restoreAllMocks();
});

describe("hexagonPolygon", () => {
  it("draws six points around the centre", () => {
    const polygon = hexagonPolygon(100, 50, 10);
    expect(polygon.startsWith("polygon(")).toBe(true);
    expect(polygon.match(/px \d/g)).toHaveLength(6);
    expect(polygon).toContain("110.0px 50.0px");
  });

  it("collapses to the centre at radius 0", () => {
    expect(hexagonPolygon(20, 30, 0)).toBe(
      `polygon(${Array(6).fill("20.0px 30.0px").join(", ")})`,
    );
  });
});

describe("apertureClip", () => {
  it("covers the whole screen when closed and keeps the same points open", () => {
    const closed = apertureClip(0, 800, 600);
    const open = apertureClip(1, 800, 600);
    expect(closed.startsWith("polygon(evenodd, 0px 0px, 800px 0px")).toBe(true);
    expect(closed.split(",").length).toBe(open.split(",").length);
    // Fully open, the hole reaches past the screen's corners.
    const xs = [...open.matchAll(/(-?[\d.]+)px (-?[\d.]+)px/g)].map((m) =>
      Number(m[1]),
    );
    expect(Math.max(...xs)).toBeGreaterThan(800);
    expect(Math.min(...xs)).toBeLessThan(0);
  });
});

describe("originOf", () => {
  it("uses the centre of the control's label", () => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    label.append(input);
    label.getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 40,
      height: 20,
    });
    expect(originOf(input)).toEqual({ x: 30, y: 30 });
  });

  it("falls back to the top-right corner without a control", () => {
    expect(originOf(null)).toEqual({ x: window.innerWidth - 40, y: 40 });
  });
});

describe("switchThemeWithAperture", () => {
  it("switches instantly without View Transitions", () => {
    const update = vi.fn();
    switchThemeWithAperture({ x: 0, y: 0 }, update);
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement.hasAttribute("data-theme-switch")).toBe(
      false,
    );
  });

  it("switches instantly under reduced motion", () => {
    const start = vi.fn();
    document.startViewTransition = start;
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true });
    const update = vi.fn();
    switchThemeWithAperture({ x: 0, y: 0 }, update);
    expect(update).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
  });

  it("runs the update inside a view transition and cleans up after", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false });
    let finish;
    const finished = new Promise((resolve) => {
      finish = resolve;
    });
    document.startViewTransition = vi.fn((callback) => {
      callback();
      return { ready: Promise.reject(new Error("skip")), finished };
    });
    const update = vi.fn();
    switchThemeWithAperture({ x: 0, y: 0 }, update);
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement.hasAttribute("data-theme-switch")).toBe(
      true,
    );
    finish();
    await finished;
    await Promise.resolve();
    expect(document.documentElement.hasAttribute("data-theme-switch")).toBe(
      false,
    );
  });
});
