// Attendance is one of four states, splitting two ways: a "yes"/"no" axis for
// whether someone's in the office, and a "confirmed"/"planning" axis for whether
// they've locked it in. "planning-no" is the default for anyone unlisted
// (tentatively/planning to be out).
export type AttendanceStatus =
  | "confirmed-yes"
  | "planning-yes"
  | "planning-no"
  | "confirmed-no"
  | "confirmed-elsewhere";

/** Whether a status counts as being in the office (as opposed to out). */
export const isInOffice = (status: AttendanceStatus) =>
  status === "confirmed-yes" || status === "planning-yes";

/** One roster member's status for a single day. */
export interface RosterUser {
  userId: number;
  name: string;
  status: AttendanceStatus;
}

export type WeekSchedule = Record<string, RosterUser[]>;
