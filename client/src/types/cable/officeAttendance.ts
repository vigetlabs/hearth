export interface AttendanceWeekConfirmedMessage {
  type: "attendance.week.confirmed";
  office_id: number;
  starts_on: string;
}
