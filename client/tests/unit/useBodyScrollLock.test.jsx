import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { useBodyScrollLock } from "../../src/hooks/useBodyScrollLock";

function LockProbe({ active }) {
  useBodyScrollLock(active);
  return null;
}

describe("useBodyScrollLock", () => {
  afterEach(() => {
    document.body.style.overflow = "";
    cleanup();
  });

  it("locks body scroll while active and restores it when deactivated", () => {
    const { rerender } = render(<LockProbe active={false} />);
    expect(document.body.style.overflow).toBe("");

    rerender(<LockProbe active />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<LockProbe active={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("restores body scroll on unmount while still active", () => {
    const { unmount } = render(<LockProbe active />);
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
