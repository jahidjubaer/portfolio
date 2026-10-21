import { calendarDate } from "../../lib/dates";

/**
 * Pure helpers for the learning journal (R3): syllabus progress, the
 * current topic, and the study calendar. Dates are "YYYY-MM-DD" strings,
 * compared as text; "today" is the site's calendar date (Asia/Dhaka), so
 * the prerendered page and the visitor agree.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Done topics over all topics. Null when the track has no syllabus.
 * @param {{ syllabus?: Array<{ status: string }> }} track
 * @returns {{ done: number, total: number, percent: number } | null}
 */
export function trackProgress(track) {
  const topics = track.syllabus ?? [];
  if (topics.length === 0) return null;
  const done = topics.filter((topic) => topic.status === "done").length;
  return {
    done,
    total: topics.length,
    percent: Math.round((done / topics.length) * 100),
  };
}

/**
 * The topic being studied: the first "doing" one, else the first not done.
 * @param {{ syllabus?: Array<{ title: string, status: string }> }} track
 */
export function currentTopic(track) {
  const topics = track.syllabus ?? [];
  return (
    topics.find((topic) => topic.status === "doing") ??
    topics.find((topic) => topic.status !== "done") ??
    null
  );
}

/**
 * Which public tracks are in "Now studying": those being learned that
 * have a syllabus or a logged session, so the strip is never empty talk.
 * @param {import("../../data/learning").LearningTrack[]} tracks
 * @param {Map<string, string>} lastStudied
 */
export function nowStudyingTracks(tracks, lastStudied) {
  return tracks.filter(
    (track) =>
      track.status === "learning" &&
      ((track.syllabus ?? []).length > 0 || lastStudied.has(track.id)),
  );
}

/** The newest entry's date for each track id. Entries come newest first. */
export function lastStudiedByTrack(entries) {
  const last = new Map();
  for (const entry of entries) {
    if (!last.has(entry.trackId)) last.set(entry.trackId, entry.date);
  }
  return last;
}

const toKey = (time) => new Date(time).toISOString().slice(0, 10);

/** "YYYY-MM-DD" for a date in the site's time zone. */
export function siteDateKey(date) {
  const { year, month, day } = calendarDate(date);
  return toKey(Date.UTC(year, month - 1, day));
}

/**
 * Weeks × days for the last `weeks` weeks up to `now`'s week (Sunday
 * first), each day with its entries and minutes. Days after today are
 * marked `future` and drawn empty.
 * @param {Array<{ date: string, minutes?: number }>} entries
 * @param {Date} now
 * @param {number} [weeks]
 */
export function buildStudyCalendar(entries, now, weeks = 26) {
  const today = siteDateKey(now);
  const todayTime = Date.parse(today);
  const weekday = new Date(todayTime).getUTCDay();
  const start = todayTime - (weekday + (weeks - 1) * 7) * DAY_MS;
  const byDate = new Map();
  for (const entry of entries) {
    const day = byDate.get(entry.date) ?? { count: 0, minutes: 0 };
    day.count += 1;
    day.minutes += entry.minutes ?? 0;
    byDate.set(entry.date, day);
  }

  const columns = [];
  let studyDays = 0;
  let minutes = 0;
  for (let week = 0; week < weeks; week += 1) {
    const days = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = toKey(start + (week * 7 + offset) * DAY_MS);
      const day = byDate.get(date);
      const future = date > today;
      if (day && !future) {
        studyDays += 1;
        minutes += day.minutes;
      }
      days.push({
        date,
        future,
        count: future ? 0 : (day?.count ?? 0),
        minutes: future ? 0 : (day?.minutes ?? 0),
      });
    }
    columns.push(days);
  }
  return { columns, studyDays, minutes, from: columns[0][0].date, today };
}

/**
 * 0–4 shade for a day: by minutes when logged, else by entry count.
 * @param {{ count: number, minutes: number }} day
 */
export function studyLevel(day) {
  if (day.count === 0) return 0;
  if (day.minutes === 0) return Math.min(4, day.count);
  if (day.minutes < 30) return 1;
  if (day.minutes < 60) return 2;
  if (day.minutes < 120) return 3;
  return 4;
}

/** "1 h 30 min", "45 min". */
export function formatMinutes(total) {
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Tue, Oct 20, 2026" for "2026-10-20". */
export function formatStudyDay(date) {
  return DAY_FORMAT.format(new Date(`${date}T00:00:00Z`));
}

/**
 * Entries grouped by day, newest day first, keeping their order.
 * @template {{ date: string }} T
 * @param {T[]} entries
 * @returns {Array<{ date: string, entries: T[] }>}
 */
export function groupByDay(entries) {
  const groups = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last?.date === entry.date) last.entries.push(entry);
    else groups.push({ date: entry.date, entries: [entry] });
  }
  return groups;
}
