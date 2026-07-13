/**
 * A week is either being planned or has been confirmed. The calendar renders
 * differently in each state; the planning view is where people opt in/out of
 * days before the week is locked in.
 */
export type WeekState = "planning" | "confirmed";

/**
 * Where a person stands on a given day:
 * - `confirmed` — committed to being in the office
 * - `maybe` — tentatively planning to
 * - `no` — a regular of this office who isn't coming in that day
 */
export type AttendanceStatus = "confirmed" | "maybe" | "no";

/** One roster member's status for a single day. */
export interface PersonStatus {
  name: string;
  status: AttendanceStatus;
}

/**
 * Attendance keyed by `YYYY-MM-DD` (see `toDateKey`). Each day carries the same
 * office roster in a stable order; only each person's status changes day to day.
 */
export type WeekSchedule = Record<string, PersonStatus[]>;
