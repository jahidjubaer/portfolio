import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StickyContactFab } from "../../../src/features/projects/StickyContactFab";

function setScrollMetrics({ scrollY, scrollHeight, innerHeight }) {
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: innerHeight,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
}

describe("StickyContactFab", () => {
  beforeEach(() => {
    setScrollMetrics({ scrollY: 0, scrollHeight: 4000, innerHeight: 800 });
  });

  afterEach(() => {
    delete document.documentElement.scrollHeight;
  });

  it("stays hidden before the reader scrolls", () => {
    render(
      <MemoryRouter>
        <StickyContactFab />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole("link", { name: "Contact" }),
    ).not.toBeInTheDocument();
  });

  it("appears mid-article and hides again near the page bottom", async () => {
    render(
      <MemoryRouter>
        <StickyContactFab />
      </MemoryRouter>,
    );

    setScrollMetrics({ scrollY: 1200, scrollHeight: 4000, innerHeight: 800 });
    fireEvent.scroll(window);
    const link = await screen.findByRole("link", { name: "Contact" });
    expect(link).toHaveAttribute("href", "/contact");

    // Near the bottom the pager/footer take over — the FAB unmounts.
    setScrollMetrics({ scrollY: 3100, scrollHeight: 4000, innerHeight: 800 });
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(
        screen.queryByRole("link", { name: "Contact" }),
      ).not.toBeInTheDocument();
    });
  });
});
