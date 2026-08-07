import type { CalendarDateAttendanceFacts } from "@/types/calendar/attendance/attendanceFacts";
import type { CalendarAttendanceResolution } from "@/types/calendar/attendance/attendanceRules";
import { ATTENDANCE_RULES } from "./attendanceRules";

export function resolveAttendanceStatus(
  facts: CalendarDateAttendanceFacts,
): CalendarAttendanceResolution {
  const rule = ATTENDANCE_RULES.find((candidate) => candidate.matches(facts));

  if (!rule) {
    throw new Error("Attendance rules must contain a fallback rule");
  }

  return {
    status: rule.status,
    matchedRule: rule.id,
  };
}
