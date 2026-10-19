const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Short, human relative date for "last updated" labels: "today",
 * "yesterday", "5 days ago", "3 weeks ago", "2 months ago", "1 year ago".
 * @param {string | Date} date
 * @param {Date} [now]
 */
export function formatRelativeDate(date, now = new Date()) {
  const then = new Date(date);
  const startOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(then)) / DAY_MS);

  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
