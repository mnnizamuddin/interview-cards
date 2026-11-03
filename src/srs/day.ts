/**
 * Calendar days in the learner's local time zone, as `YYYY-MM-DD` keys. Scheduling works in
 * whole days, like Duolingo: a card is due "today", not at 14:32.
 */

export type DayKey = string;

/** Returns the local calendar day of `date`. */
export function toDayKey(date: Date): DayKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the day `count` days after `day` (or before, when negative). */
export function addDays(day: DayKey, count: number): DayKey {
  const [year, month, date] = day.split('-').map(Number);
  // Noon avoids landing on the wrong day when a daylight saving change shifts midnight.
  const shifted = new Date(year!, month! - 1, date! + count, 12);
  return toDayKey(shifted);
}
