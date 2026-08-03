import type { CalendarDateAttendanceFacts } from "./attendanceFacts";
import type { CalendarDateAttendanceStatus } from "./attendanceStatus";

export type CalendarAttendanceRuleId =
  | "external-visit"
  | "persisted-visit"
  | "confirmed-absence"
  | "selected-override"
  | "deselected-override"
  | "editing-visit"
  | "editing-absence"
  | "default-schedule"
  | "fallback";

  export interface CalendarAttendanceResolution {
    status: CalendarDateAttendanceStatus;
    matchedRule: CalendarAttendanceRuleId
  }

  export interface CalendarAttendanceRule {
    id: CalendarAttendanceRuleId;
    matches: (facts: CalendarDateAttendanceFacts) => boolean;
    status: CalendarDateAttendanceStatus
  }
