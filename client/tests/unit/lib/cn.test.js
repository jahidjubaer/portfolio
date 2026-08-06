import { describe, expect, it } from "vitest";
import { cn } from "../../../src/lib/cn";

describe("cn", () => {
  it("joins static class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, 0, "b")).toBe("a b");
  });

  it("applies conditional classes from objects", () => {
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });

  it("merges conflicting Tailwind utilities, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges conflicting color utilities across variants", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
