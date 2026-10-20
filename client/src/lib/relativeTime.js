import { calendarDate } from "./dates";

const DAY_MS = 24 * 60 * 60 * 1000;

// Day boundaries in the site's time zone, so the build and the visitor agree.
const startOfDay = (date) => {
  const { year, month, day } = calendarDate(date);
  return Date.UTC(year, month - 1, day);
};

/**
 * Short, human relative date for "last updated" labels: "today",
 * "yesterday", "5 days ago", "3 weeks ago", "2 months ago", "1 year ago".
 * @param {string | Date} date
 * @param {Date} [now]
 */
export function formatRelativeDate(date, now = new Date()) {
  const then = new Date(date);
  const days = Math.round((startOfDay(now) - startOfDay(then)) / DAY_MS);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
