import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "../../src/features/motion/Reveal";
import { MotionProvider } from "../../src/features/motion/MotionProvider";

function mockMatchMedia(reducedMotion) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: reducedMotion && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Reveal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps content present in the DOM before the in-view animation fires", () => {
    // The IntersectionObserver mock in tests/setup.js never calls back,
    // so this renders in the "hidden" (not-yet-revealed) animation
    // state — content must still be readable, not display:none/removed.
    mockMatchMedia(false);
    render(
      <MotionProvider>
        <Reveal>Important content</Reveal>
      </MotionProvider>,
    );

    expect(screen.getByText("Important content")).toBeInTheDocument();
  });

  it("keeps content present under a reduced-motion preference", () => {
    mockMatchMedia(true);
    render(
      <MotionProvider>
        <Reveal>Important content</Reveal>
      </MotionProvider>,
    );

    expect(screen.getByText("Important content")).toBeInTheDocument();
  });
});
