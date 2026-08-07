import type { AttendanceMode } from "@/types/calendar/attendance/attendanceFacts";

interface ResolveAttendanceModeInput {
  isEditing: boolean;
  isConfirmed: boolean;
}

export function resolveAttendanceMode({
  isEditing,
  isConfirmed,
}: ResolveAttendanceModeInput): AttendanceMode {
  if (isEditing) {
    return "editing";
  }

  if (isConfirmed) {
    return "confirmed";
  }

  return "planning";
}
