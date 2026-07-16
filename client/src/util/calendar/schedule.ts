import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { toDateKey } from "@/util/dates/date";

// `Date.getDay()` order (0 = Sunday … 6 = Saturday), used to read the matching
// weekday off a user's `default_schedule`.
const WEEKDAY_FIELDS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

// Matches `userDisplayName`: first name plus the last name's initial.
function displayName(user: Pick<User, "first_name" | "last_name">): string {
  const lastInitial = user.last_name[0];

  return lastInitial ? `${user.first_name} ${lastInitial}` : user.first_name;
}

function getVisitKey(userId: number, visitDate: string): string {
  return `${userId}:${visitDate}`;
}

function mapVisitStatus(status: Visit["status"]): AttendanceStatus {
  switch (status) {
    case "confirmed":
      return "confirmed-yes";
    case "planned":
      return "planning-yes";
  }
}

export function buildWeekSchedule(
  users: User[],
  visits: Visit[],
  weekDates: Date[],
): WeekSchedule {
  const visitsByUserAndDate = new Map(
    visits.map((visit) => [
      getVisitKey(visit.user.id, visit.visit_date),
      visit,
    ]),
  );

  const schedule: WeekSchedule = {};

  for (const date of weekDates) {
    const dateKey = toDateKey(date);
    const weekday = WEEKDAY_FIELDS[date.getDay()];

    schedule[dateKey] = users.map((user): PersonStatus => {
      const visit = visitsByUserAndDate.get(getVisitKey(user.id, dateKey));

      const status: AttendanceStatus = visit
        ? mapVisitStatus(visit.status)
        : user.default_schedule?.[weekday]
          ? "planning-yes"
          : "planning-no";

      return {
        userId: user.id,
        name: displayName(user),
        status,
      };
    });
  }
  return schedule;
}
