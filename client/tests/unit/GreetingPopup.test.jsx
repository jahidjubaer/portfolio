import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MotionGlobalConfig } from "motion/react";
import {
  GREETING_DELAY_MS,
  GREETING_SEEN_KEY,
  GreetingPopup,
} from "../../src/features/greeting/GreetingPopup";

function renderAt(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GreetingPopup />
    </MemoryRouter>,
  );
}

function advance(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("GreetingPopup", () => {
  beforeEach(() => {
    MotionGlobalConfig.skipAnimations = true;
    vi.useFakeTimers();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    MotionGlobalConfig.skipAnimations = false;
    vi.useRealTimers();
  });

  it("greets the visitor after a short delay, then offers quick replies", () => {
    renderAt();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();

    advance(GREETING_DELAY_MS);
    expect(
      screen.getByRole("complementary", { name: /message from jahid/i }),
    ).toBeInTheDocument();

    advance(2000);
    expect(screen.getByText(/assalamu alaikum/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "I'm hiring" })).toHaveAttribute(
      "href",
      "/contact?subject=Job%20opportunity",
    );
  });

  it("shows only once per session", () => {
    window.sessionStorage.setItem(GREETING_SEEN_KEY, "1");
    renderAt();
    advance(GREETING_DELAY_MS * 2);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("stays hidden on the contact page", () => {
    renderAt("/contact");
    advance(GREETING_DELAY_MS * 2);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("closes with the close button", async () => {
    renderAt();
    advance(GREETING_DELAY_MS);
    fireEvent.click(screen.getByRole("button", { name: "Close message" }));
    vi.useRealTimers();
    await waitFor(() =>
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument(),
    );
  });

  it("closes with Escape", async () => {
    renderAt();
    advance(GREETING_DELAY_MS);
    fireEvent.keyDown(screen.getByRole("button", { name: "Close message" }), {
      key: "Escape",
    });
    vi.useRealTimers();
    await waitFor(() =>
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument(),
    );
  });
});
