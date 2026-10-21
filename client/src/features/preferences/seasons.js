/**
 * The six seasons (ষড়ঋতু) of Bangladesh, docs/15. The revised Bangla
 * calendar (Bangla Academy, 2019) fixes each month's Gregorian start, and
 * each season is two months. Ordered by where they start in the
 * Gregorian year; Sheet runs over New Year, so it's both last and the
 * season before 14 February. Mirrors the inline script in index.html.
 */
export const SEASON_STARTS = [
  { id: "basanta", month: 2, day: 14 },
  { id: "grishma", month: 4, day: 14 },
  { id: "barsha", month: 6, day: 15 },
  { id: "sharat", month: 8, day: 16 },
  { id: "hemanta", month: 10, day: 17 },
  { id: "sheet", month: 12, day: 16 },
];

/**
 * The season's id on the visitor's local date.
 * @param {Date} date
 * @returns {string}
 */
export function seasonOn(date) {
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  let season = "sheet";
  for (const start of SEASON_STARTS) {
    if (today >= start.month * 100 + start.day) season = start.id;
  }
  return season;
}
