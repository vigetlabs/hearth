export type WeekState = "planning" | "confirmed";

export type AttendanceStatus = "confirmed" | "maybe" | "no";

/** One roster member's status for a single day. */
export interface PersonStatus {
  name: string;
  status: AttendanceStatus;
}

export type WeekSchedule = Record<string, PersonStatus[]>;
