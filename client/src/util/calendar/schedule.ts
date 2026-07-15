import type { User } from "@/types/api/users";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";
import type { MockVisit } from "@/util/api/mock/visits";
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
const displayName = (user: Pick<User, "first_name" | "last_name">) =>
  `${user.first_name} ${user.last_name[0] ?? ""}`.trim();

/**
 * Builds the `WeekSchedule` the calendar consumes from a roster and its visits,
 * narrowed to a single office. Applies the attendance mapping documented in
 * `@/util/api/mock/visits`:
 *   - a confirmed visit                                   → "confirmed-yes"
 *   - a tentative visit, or a matching `default_schedule` → "planning-yes"
 *   - neither                                             → "planning-no" (out)
 */
export function buildWeekSchedule(
  users: User[],
  visits: MockVisit[],
  weekDates: Date[],
  officeId: number,
): WeekSchedule {
  const roster = users.filter((user) => user.office_id === officeId);
  const schedule: WeekSchedule = {};

  for (const date of weekDates) {
    const key = toDateKey(date);
    const weekday = WEEKDAY_FIELDS[date.getDay()];

    schedule[key] = roster.map((user): PersonStatus => {
      const visit = visits.find(
        (v) =>
          v.office_id === officeId &&
          v.visit_date === key &&
          v.user.id === user.id,
      );

      let status: AttendanceStatus;
      if (visit) {
        status = visit.is_confirmed ? "confirmed-yes" : "planning-yes";
      } else if (user.default_schedule?.[weekday]) {
        status = "planning-yes";
      } else {
        status = "planning-no";
      }

      return { name: displayName(user), status };
    });
  }

  return schedule;
}

/**
 * The logged-in user is part of the roster too. Returns a new schedule that
 * seeds them into each day as "out" (unless a visit already placed them) so
 * they show up and can toggle themselves in. The day cell sorts everyone by
 * status and name, so insertion order doesn't matter.
 */
export function seedSelf(
  schedule: WeekSchedule,
  me: string,
  weekDates: Date[],
): WeekSchedule {
  if (!me) return schedule;

  const seeded: WeekSchedule = { ...schedule };
  for (const date of weekDates) {
    const key = toDateKey(date);
    const day = seeded[key] ?? [];
    if (!day.some((person) => person.name === me)) {
      seeded[key] = [{ name: me, status: "planning-no" }, ...day];
    }
  }

  return seeded;
}
