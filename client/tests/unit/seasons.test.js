import { describe, expect, it } from "vitest";
import { seasonOn } from "../../src/features/preferences/seasons";

// Month is 1-based here, like the calendar table.
const on = (month, day) => seasonOn(new Date(2026, month - 1, day));

describe("seasonOn", () => {
  it("starts each season on its Bangla month's first day", () => {
    expect(on(2, 14)).toBe("basanta");
    expect(on(4, 14)).toBe("grishma");
    expect(on(6, 15)).toBe("barsha");
    expect(on(8, 16)).toBe("sharat");
    expect(on(10, 17)).toBe("hemanta");
    expect(on(12, 16)).toBe("sheet");
  });

  it("keeps the season before each start", () => {
    expect(on(2, 13)).toBe("sheet");
    expect(on(4, 13)).toBe("basanta");
    expect(on(6, 14)).toBe("grishma");
    expect(on(8, 15)).toBe("barsha");
    expect(on(10, 16)).toBe("sharat");
    expect(on(12, 15)).toBe("hemanta");
  });

  it("runs winter over New Year", () => {
    expect(on(12, 31)).toBe("sheet");
    expect(on(1, 1)).toBe("sheet");
  });
});
