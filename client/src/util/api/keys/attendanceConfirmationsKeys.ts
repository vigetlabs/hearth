const ATTENDANCE_KEY = "attendance-confirmations";

export function generateAttendanceConfirmationKey(
  officeId: number,
  startsOn: string,
): [string, number, string] {
  return [ATTENDANCE_KEY, officeId, startsOn];
}
