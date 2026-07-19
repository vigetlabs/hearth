import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { toDateKey } from "@/util/dates/date";

const WEEKDAY_FIELDS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type WeekdayField = (typeof WEEKDAY_FIELDS)[number];

function displayName(user: Pick<User, "first_name" | "last_name">): string {
  const lastInitial = user.last_name[0];

  return lastInitial ? `${user.first_name} ${lastInitial}` : user.first_name;
}

function getVisitKey(userId: number, visitDate: string): string {
  return `${userId}:${visitDate}`;
}

function personStatusFromUser(
  user: Pick<User, "id" | "first_name" | "last_name">,
  status: AttendanceStatus,
): PersonStatus {
  return {
    userId: user.id,
    name: displayName(user),
    status,
  };
}

function homeUserStatus({
  user,
  visit,
  weekday,
  isWeekConfirmed,
}: {
  user: User;
  visit: Visit | undefined;
  weekday: WeekdayField;
  isWeekConfirmed: boolean;
}): AttendanceStatus {
  if (visit) {
    return "confirmed-yes";
  }

  if (isWeekConfirmed) {
    return "confirmed-no";
  }

  if (user.default_schedule?.[weekday]) {
    return "planning-yes";
  }

  return "planning-no";
}

export function buildWeekSchedule(
  users: User[],
  visits: Visit[],
  weekDates: Date[],
  confirmedUserIds: ReadonlySet<number>,
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

      const status = homeUserStatus({
        user,
        visit,
        weekday,
        isWeekConfirmed: confirmedUserIds.has(user.id),
      });

      return personStatusFromUser(user, status);
    });
  }

  return schedule;
}
