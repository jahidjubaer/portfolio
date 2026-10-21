import { describe, expect, it } from "vitest";
import {
  buildStudyCalendar,
  currentTopic,
  formatMinutes,
  formatStudyDay,
  groupByDay,
  lastStudiedByTrack,
  nowStudyingTracks,
  siteDateKey,
  studyLevel,
  trackProgress,
} from "../../../src/features/learning-tracks/journal";

const syllabus = [
  { title: "Rendering", status: "done" },
  { title: "Hooks", status: "doing" },
  { title: "Suspense", status: "todo" },
  { title: "Server", status: "todo" },
];

describe("learning journal helpers", () => {
  it("counts progress from the syllabus, never a typed number", () => {
    expect(trackProgress({ syllabus })).toEqual({
      done: 1,
      total: 4,
      percent: 25,
    });
    expect(trackProgress({})).toBeNull();
  });

  it("finds the current topic: doing first, else the first not done", () => {
    expect(currentTopic({ syllabus }).title).toBe("Hooks");
    expect(
      currentTopic({
        syllabus: [
          { title: "A", status: "done" },
          { title: "B", status: "todo" },
        ],
      }).title,
    ).toBe("B");
    expect(currentTopic({ syllabus: [{ title: "A", status: "done" }] })).toBe(
      null,
    );
  });

  it("uses the site's calendar date, not UTC", () => {
    // 20:00 UTC is already the next day in Dhaka (UTC+6).
    expect(siteDateKey(new Date("2026-10-20T20:00:00Z"))).toBe("2026-10-21");
  });

  it("builds 26 weeks ending in this week, ignoring future days", () => {
    const now = new Date("2026-10-21T06:00:00Z"); // a Wednesday in Dhaka
    const calendar = buildStudyCalendar(
      [
        { date: "2026-10-21", minutes: 30 },
        { date: "2026-10-21", minutes: 45 },
        { date: "2026-10-01" },
        { date: "2026-10-23", minutes: 60 },
        { date: "2025-01-01", minutes: 60 },
      ],
      now,
    );
    expect(calendar.columns).toHaveLength(26);
    expect(calendar.columns.every((week) => week.length === 7)).toBe(true);
    expect(calendar.from).toBe("2026-04-26"); // a Sunday
    expect(calendar.today).toBe("2026-10-21");
    expect(calendar.studyDays).toBe(2);
    expect(calendar.minutes).toBe(75);
    const lastWeek = calendar.columns.at(-1);
    expect(lastWeek[3]).toMatchObject({ date: "2026-10-21", count: 2 });
    expect(lastWeek[5]).toMatchObject({ future: true, count: 0 });
  });

  it("shades days by minutes, or by count when untimed", () => {
    expect(studyLevel({ count: 0, minutes: 0 })).toBe(0);
    expect(studyLevel({ count: 2, minutes: 0 })).toBe(2);
    expect(studyLevel({ count: 1, minutes: 20 })).toBe(1);
    expect(studyLevel({ count: 1, minutes: 150 })).toBe(4);
  });

  it("formats and groups", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(90)).toBe("1 h 30 min");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatStudyDay("2026-10-20")).toBe("Tue, Oct 20, 2026");
    expect(
      groupByDay([
        { id: "a", date: "2026-10-21" },
        { id: "b", date: "2026-10-21" },
        { id: "c", date: "2026-10-19" },
      ]).map((day) => [day.date, day.entries.length]),
    ).toEqual([
      ["2026-10-21", 2],
      ["2026-10-19", 1],
    ]);
  });

  it("lists tracks being learned that have a syllabus or a session", () => {
    const entries = [
      { trackId: "dsa", date: "2026-10-21" },
      { trackId: "dsa", date: "2026-10-01" },
    ];
    const last = lastStudiedByTrack(entries);
    expect(last.get("dsa")).toBe("2026-10-21");
    expect(
      nowStudyingTracks(
        [
          { id: "react", status: "learning", syllabus },
          { id: "dsa", status: "learning" },
          { id: "python", status: "learning" },
          { id: "cpp", status: "applied", syllabus },
        ],
        last,
      ).map((track) => track.id),
    ).toEqual(["react", "dsa"]);
  });
});
