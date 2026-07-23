export interface AttendanceWeekConfirmedMessage {
  type: "attendance.week.confirmed";
  office_id: number;
  starts_on: string;
}

export interface AttendanceEditingUpdatedMessage {
  type: "attendance.editing.updated";
  office_id: number;
  week_start: string;
  editing_user_ids: number[];
}

export interface AttendanceVisitsRemovedMessage {
  type: "attendance.visits.removed";
  office_id: number;
  week_start: string;
  user_id: number;
}

export type OfficeAttendanceMessage =
  | AttendanceWeekConfirmedMessage
  | AttendanceEditingUpdatedMessage
  | AttendanceVisitsRemovedMessage;
