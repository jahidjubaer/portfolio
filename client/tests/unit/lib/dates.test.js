import { describe, expect, it } from "vitest";
import {
  byRecency,
  byStartRecency,
  formatDuration,
  formatRange,
  formatYearMonth,
} from "../../../src/lib/dates";

const NOW = new Date(2026, 9, 20); // Oct 2026

describe("dates", () => {
  it("formats years and year-months", () => {
    expect(formatYearMonth("2024")).toBe("2024");
    expect(formatYearMonth("2024-06")).toBe("Jun 2024");
  });

  it("formats ranges, including current roles", () => {
    expect(formatRange({ start: "2023", end: "2024" })).toBe("2023 – 2024");
    expect(formatRange({ start: "2024-06", current: true })).toBe(
      "Jun 2024 – Present",
    );
    expect(formatRange({ end: "2026-08" })).toBe("Aug 2026");
  });

  it("counts months like LinkedIn (both ends included)", () => {
    expect(formatDuration("2019-10", "2023-07")).toBe("3 yrs 10 mos");
    expect(formatDuration("2016-11", "2019-09")).toBe("2 yrs 11 mos");
    expect(formatDuration("2024-01", "2024-01")).toBe("1 mo");
    expect(formatDuration("2025-11", undefined, NOW)).toBe("1 yr");
  });

  it("counts whole years when only years are known", () => {
    expect(formatDuration("2023", "2025")).toBe("2 yrs");
    expect(formatDuration("2024", "2025")).toBe("1 yr");
    // Same year with no months: nothing rather than a guess.
    expect(formatDuration("2024", "2024")).toBeNull();
  });

  it("sorts current first, then by end date", () => {
    const items = [
      { start: "2019", end: "2021" },
      { start: "2024-01", current: true },
      { start: "2023", end: "2025" },
    ];
    expect([...items].sort(byRecency)).toEqual([items[1], items[2], items[0]]);
  });

  it("lists roles by start date, current first", () => {
    const member = { start: "2022", end: "2025" };
    const secretary = { start: "2024", end: "2025" };
    const joint = { start: "2023", end: "2024" };
    const president = { start: "2021", current: true };
    expect([member, joint, secretary, president].sort(byStartRecency)).toEqual([
      president,
      secretary,
      joint,
      member,
    ]);
  });
});
