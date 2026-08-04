import type { User } from "@/types/api/users";

export function isDefaultScheduleDay(
  user: Pick<User, "default_schedule">,
  date: Date
): boolean {
  const schedule = user.default_schedule;

  if (!schedule) {
    return false;
  }

  return schedule[date.getDay()]
}
