import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type {
  AttendanceStatus,
  RosterUser,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { generateDateKey } from "@/util/dates/date";
import { userDisplayName } from "../auth/displayName";
import type { ChannelSerializedUser } from "@/types/cable/officePlanning";

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

function generateUserIdVisitKey(userId: number, visitDate: string): string {
  return `${userId}:${visitDate}`;
}

function buildRosterUser(
  user: ChannelSerializedUser,
  status: AttendanceStatus,
): RosterUser {
  return {
    userId: user.id,
    name: userDisplayName(user),
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
      generateUserIdVisitKey(visit.user.id, visit.visit_date),
      visit,
    ]),
  );

  const schedule: WeekSchedule = {};

  for (const date of weekDates) {
    const dateKey: string = generateDateKey(date);
    const weekday: WeekdayField = WEEKDAY_FIELDS[date.getDay()];

    schedule[dateKey] = users.map((user): RosterUser => {
      const visit: Visit = visitsByUserAndDate.get(
        generateUserIdVisitKey(user.id, dateKey),
      );

      const status: AttendanceStatus = homeUserStatus({
        user,
        visit,
        weekday,
        isWeekConfirmed: confirmedUserIds.has(user.id),
      });

      return buildRosterUser(user, status);
    });
  }

  return schedule;
}
