import { describe, expect, it } from "vitest";
import { calendarDate, currentYearMonth } from "../../../src/lib/dates";
import { formatRelativeDate } from "../../../src/lib/relativeTime";

// 20:30 UTC on 20 Oct is already 21 Oct in Sylhet (UTC+6): the build
// machine (UTC) and a visitor in Bangladesh must still agree.
const LATE_UTC = new Date("2026-10-20T20:30:00Z");

describe("site calendar", () => {
  it("reads dates in the site's time zone, not the machine's", () => {
    expect(calendarDate(LATE_UTC)).toEqual({ year: 2026, month: 10, day: 21 });
    expect(currentYearMonth(new Date("2026-10-31T19:00:00Z"))).toBe("2026-11");
    expect(calendarDate(new Date("2026-12-31T18:30:00Z")).year).toBe(2027);
  });
});

describe("formatRelativeDate", () => {
  it("counts days in the site's time zone", () => {
    expect(formatRelativeDate("2026-10-20T19:00:00Z", LATE_UTC)).toBe("today");
    expect(formatRelativeDate("2026-10-20T10:00:00Z", LATE_UTC)).toBe(
      "yesterday",
    );
  });

  it("scales from days to years", () => {
    expect(formatRelativeDate("2026-10-16T06:00:00Z", LATE_UTC)).toBe(
      "5 days ago",
    );
    expect(formatRelativeDate("2026-09-30T06:00:00Z", LATE_UTC)).toBe(
      "3 weeks ago",
    );
    expect(formatRelativeDate("2026-07-01T06:00:00Z", LATE_UTC)).toBe(
      "3 months ago",
    );
    expect(formatRelativeDate("2025-06-01T06:00:00Z", LATE_UTC)).toBe(
      "1 year ago",
    );
  });
});
