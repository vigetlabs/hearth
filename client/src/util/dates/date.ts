/**
 * Minimal local-time date helpers for the calendar grid.
 *
 * Everything works off native `Date` in the browser's local timezone. The one
 * rule that keeps calendars bug-free: dates are looked up by a `YYYY-MM-DD`
 * string key (see `toDateKey`), never by `Date` identity.
 */

/** Local-date key in `YYYY-MM-DD` form (no timezone drift from `toISOString`). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** A new `Date` `days` after (or before, if negative) `date`. */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Midnight on the Monday of the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const daysSinceMonday = (start.getDay() + 6) % 7; // getDay: 0 = Sun … 6 = Sat
  start.setDate(start.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** True when both dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

/** True when `date` falls on a calendar day after today (local time). */
export function isFuture(date: Date, today: Date = new Date()): boolean {
  return toDateKey(date) > toDateKey(today);
}
