import type { User } from "@/types/api/users";
import type { CalendarDateAttendanceStatus } from "../attendance/attendanceStatus";
import type { CalendarAttendanceRuleId } from "../attendance/attendanceRules";
import type { Office } from "@/types/api/offices";

export type WeekSchedule = Record<string, CalendarScheduleEntry[]>;

export interface CalendarScheduleEntry {
  user: User;
  status: CalendarDateAttendanceStatus;
  resolvedBy: CalendarAttendanceRuleId;
  isVisitor: boolean;
  externalOffice: Pick<Office, "id" | "name" | "emoji">;
}
