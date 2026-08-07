import type { User } from "@/types/api/users";

const WEEKDAY_FIELDS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function isDefaultScheduleDay(
  user: Pick<User, "default_schedule">,
  date: Date,
): boolean {
  const schedule = user.default_schedule;

  if (!schedule) {
    return false;
  }

  const weekday = WEEKDAY_FIELDS[date.getDay()];
  return schedule[weekday];
}
