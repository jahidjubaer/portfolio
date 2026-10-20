/**
 * LinkedIn-style dates for content stored as "YYYY" or "YYYY-MM" (see
 * yearMonth in server/src/schemas/content.js). Durations are computed,
 * never typed, so they can't drift from the dates.
 */

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** @param {string} value "2024" | "2024-06" */
function parse(value) {
  const [year, month] = value.split("-").map(Number);
  return { year, month: month || null };
}

/** "2024-06" → "Jun 2024"; "2024" → "2024" */
export function formatYearMonth(value) {
  if (!value) return "";
  const { year, month } = parse(value);
  return month ? `${MONTH_NAMES[month - 1]} ${year}` : String(year);
}

/** Jahid's time zone (Sylhet). */
export const SITE_TIME_ZONE = "Asia/Dhaka";

const CALENDAR = new Intl.DateTimeFormat("en-US", {
  timeZone: SITE_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

/**
 * The calendar date in the site's time zone, not the visitor's: pages are
 * prerendered on a UTC build machine, and a visitor-dependent "today"
 * would make the hydration render differ from the HTML near midnight.
 * @param {Date} [date]
 * @returns {{ year: number, month: number, day: number }}
 */
export function calendarDate(date = new Date()) {
  const parts = Object.fromEntries(
    CALENDAR.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

/** @param {Date} [date] */
export function currentYearMonth(date = new Date()) {
  const { year, month } = calendarDate(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * "Jun 2024 – Present", "2023 – 2024", or one date when start is unknown.
 * @param {{ start?: string, end?: string, current?: boolean }} range
 */
export function formatRange({ start, end, current }) {
  const to = current ? "Present" : formatYearMonth(end);
  if (!start) return to;
  if (to === formatYearMonth(start)) return to;
  return `${formatYearMonth(start)} – ${to}`;
}

function plural(count, unit) {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/**
 * LinkedIn counts both ends of a month range ("Oct 2019 – Jul 2023" is
 * 3 yrs 10 mos). With only years known it counts whole years, and says
 * nothing rather than guess when both fall in the same year.
 * @param {string} start
 * @param {string} [end] omitted for a current role
 * @param {Date} [now]
 * @returns {string | null} "1 yr 2 mos", "5 mos", "2 yrs"
 */
export function formatDuration(start, end, now = new Date()) {
  if (!start) return null;
  const from = parse(start);
  const to = parse(end ?? currentYearMonth(now));
  if (!from.month || !to.month) {
    const years = to.year - from.year;
    return years > 0 ? plural(years, "yr") : null;
  }
  const months = to.year * 12 + to.month - (from.year * 12 + from.month) + 1;
  if (months <= 0) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? plural(years, "yr") : null, rest ? plural(rest, "mo") : null]
    .filter(Boolean)
    .join(" ");
}

/**
 * Sort key for "most recent first": current items first, then by end
 * date, then by start date. Year-only dates sort as the end of that year.
 * @param {{ start?: string, end?: string, current?: boolean }} item
 */
export function recencyKey({ start, end, current }) {
  const pad = (value) => (value ?? "0000").padEnd(7, "-99");
  return `${current ? "9999-99" : pad(end ?? start)}|${pad(start)}`;
}

/** Comparator for Array#sort: most recent first. */
export function byRecency(a, b) {
  return recencyKey(b).localeCompare(recencyKey(a));
}

/**
 * Comparator for roles within one organization, as LinkedIn lists them:
 * current roles first, then by start date, newest first.
 */
export function byStartRecency(a, b) {
  if (Boolean(a.current) !== Boolean(b.current)) return a.current ? -1 : 1;
  const pad = (value) => (value ?? "0000").padEnd(7, "-99");
  return pad(b.start).localeCompare(pad(a.start)) || byRecency(a, b);
}
