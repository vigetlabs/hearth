import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { toDateKey } from "@/util/dates/date";

/**
 * Mock calendar data shaped exactly like the API responses, so it can be
 * swapped for real fetches later without changing consumers.
 *
 *   - `MOCK_OFFICES` mirrors `OfficeSerializer`.
 *   - `MOCK_USERS`   mirrors `UserSerializer` (with the nested `default_schedule`
 *                    from `ScheduleSerializer`).
 *   - `MOCK_VISITS`  mirrors `VisitSerializer`.
 *
 * How attendance maps onto these shapes, matching the real models:
 *   - "Confirmed in" for a date  → a `Visit` record with `is_confirmed: true`.
 *   - "Planning/maybe in"        → a `Visit` record with `is_confirmed: false`
 *                                  (a tentative RSVP), or the user's
 *                                  `default_schedule` has that weekday set with
 *                                  no visit yet.
 *   - "Out"                      → neither.
 *
 * Not wired up yet — this is data only.
 */

/** The user serializer nests only these fields on each visit. */
type VisitUser = Pick<User, "id" | "first_name" | "last_name">;

/**
 * The visit serializer also returns `office_id` and `is_confirmed`, both absent
 * from the generated OpenAPI `visit` schema (regenerate to drop these locals),
 * and returns a concrete `user` object (typed `unknown` upstream). This models
 * the real response.
 */
export type MockVisit = Omit<Visit, "user"> & {
  office_id: number;
  is_confirmed: boolean;
  user: VisitUser;
};

export const DEFAULT_OFFICE_ID = 1;

export const MOCK_OFFICES: Office[] = [
  {
    id: 1,
    name: "Boulder",
    city: "Boulder",
    state: "CO",
    timezone: "America/Denver",
    emoji: "⛰️",
  },
  {
    id: 2,
    name: "Falls Church",
    city: "Falls Church",
    state: "VA",
    timezone: "America/New_York",
    emoji: "🌸",
  },
];

// A default weekly schedule, Monday–Friday, with the weekend off. The five
// booleans line up with the sample week (Mon 2026-07-13 … Fri 2026-07-17).
function weekdaySchedule(
  id: number,
  [mon, tue, wed, thu, fri]: [boolean, boolean, boolean, boolean, boolean],
): NonNullable<User["default_schedule"]> {
  return {
    id,
    is_default: true,
    monday: mon,
    tuesday: tue,
    wednesday: wed,
    thursday: thu,
    friday: fri,
    saturday: false,
    sunday: false,
  };
}

export const MOCK_USERS: User[] = [
  // Boulder (office_id 1)
  {
    id: 1,
    email: "jackson.f@example.com",
    first_name: "Jackson",
    last_name: "F",
    office_id: 1,
    default_schedule: weekdaySchedule(1, [true, true, false, false, true]),
  },
  {
    id: 2,
    email: "abby.s@example.com",
    first_name: "Abby",
    last_name: "S",
    office_id: 1,
    default_schedule: weekdaySchedule(2, [true, false, false, true, true]),
  },
  {
    id: 3,
    email: "natalie.d@example.com",
    first_name: "Natalie",
    last_name: "D",
    office_id: 1,
    default_schedule: weekdaySchedule(3, [true, false, true, true, false]),
  },
  {
    id: 4,
    email: "tommy.b@example.com",
    first_name: "Tommy",
    last_name: "B",
    office_id: 1,
    default_schedule: weekdaySchedule(4, [false, false, false, true, true]),
  },
  {
    id: 5,
    email: "laura.l@example.com",
    first_name: "Laura",
    last_name: "L",
    office_id: 1,
    default_schedule: weekdaySchedule(5, [true, true, false, true, true]),
  },
  {
    id: 6,
    email: "blair.c@example.com",
    first_name: "Blair",
    last_name: "C",
    office_id: 1,
    default_schedule: weekdaySchedule(6, [false, true, false, true, true]),
  },
  {
    id: 7,
    email: "jeremy.f@example.com",
    first_name: "Jeremy",
    last_name: "F",
    office_id: 1,
    default_schedule: weekdaySchedule(7, [false, false, false, true, true]),
  },
  {
    id: 8,
    email: "sam.p@example.com",
    first_name: "Sam",
    last_name: "P",
    office_id: 1,
    default_schedule: weekdaySchedule(8, [false, true, true, true, false]),
  },
  {
    id: 9,
    email: "riley.k@example.com",
    first_name: "Riley",
    last_name: "K",
    office_id: 1,
    default_schedule: weekdaySchedule(9, [true, false, true, false, true]),
  },
  {
    id: 10,
    email: "morgan.t@example.com",
    first_name: "Morgan",
    last_name: "T",
    office_id: 1,
    default_schedule: weekdaySchedule(10, [false, true, false, false, false]),
  },
  // Falls Church (office_id 2)
  {
    id: 11,
    email: "priya.n@example.com",
    first_name: "Priya",
    last_name: "N",
    office_id: 2,
    default_schedule: weekdaySchedule(11, [true, true, false, true, false]),
  },
  {
    id: 12,
    email: "devon.w@example.com",
    first_name: "Devon",
    last_name: "W",
    office_id: 2,
    default_schedule: weekdaySchedule(12, [true, false, true, true, false]),
  },
  {
    id: 13,
    email: "casey.m@example.com",
    first_name: "Casey",
    last_name: "M",
    office_id: 2,
    default_schedule: weekdaySchedule(13, [true, false, true, false, true]),
  },
  {
    id: 14,
    email: "harper.g@example.com",
    first_name: "Harper",
    last_name: "G",
    office_id: 2,
    default_schedule: weekdaySchedule(14, [false, true, false, true, false]),
  },
  {
    id: 15,
    email: "xavier.r@example.com",
    first_name: "Xavier",
    last_name: "R",
    office_id: 2,
    default_schedule: weekdaySchedule(15, [false, true, false, true, false]),
  },
  {
    id: 16,
    email: "nina.q@example.com",
    first_name: "Nina",
    last_name: "Q",
    office_id: 2,
    default_schedule: weekdaySchedule(16, [true, false, false, true, true]),
  },
  {
    id: 17,
    email: "owen.v@example.com",
    first_name: "Owen",
    last_name: "V",
    office_id: 2,
    default_schedule: weekdaySchedule(17, [false, false, true, true, true]),
  },
  {
    id: 18,
    email: "bianca.t@example.com",
    first_name: "Bianca",
    last_name: "T",
    office_id: 2,
    default_schedule: weekdaySchedule(18, [false, true, false, true, false]),
  },
  {
    id: 19,
    email: "felix.j@example.com",
    first_name: "Felix",
    last_name: "J",
    office_id: 2,
    default_schedule: weekdaySchedule(19, [false, true, false, true, false]),
  },
  {
    id: 20,
    email: "zara.h@example.com",
    first_name: "Zara",
    last_name: "H",
    office_id: 2,
    default_schedule: weekdaySchedule(20, [false, false, true, true, true]),
  },
];

const usersById = new Map(MOCK_USERS.map((user) => [user.id, user]));

const VISIT_TIMESTAMP = "2026-07-10T13:42:18.123Z";

let nextVisitId = 1;

// Builds a visit in the serializer's shape, nesting the user embed the API
// returns (id, first_name, last_name). `isConfirmed` splits the two "in the
// office" states: true → "confirmed-yes", false → "planning-yes".
function visit(
  officeId: number,
  visitDate: string,
  userId: number,
  isConfirmed = true,
): MockVisit {
  const user = usersById.get(userId)!;
  return {
    id: nextVisitId++,
    office_id: officeId,
    visit_date: visitDate,
    is_confirmed: isConfirmed,
    created_at: VISIT_TIMESTAMP,
    updated_at: VISIT_TIMESTAMP,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  };
}

// Visits for the sample week (Mon 2026-07-13 … Fri 2026-07-17). Each carries an
// `is_confirmed` flag: `true` is a locked-in "confirmed-yes", `false` is a
// tentative "planning-yes" (passed explicitly below). Users with neither a
// visit nor a matching `default_schedule` weekday are "out".
export const MOCK_VISITS: MockVisit[] = [
  // Boulder — Monday 2026-07-13
  visit(1, "2026-07-13", 1),
  visit(1, "2026-07-13", 2),
  visit(1, "2026-07-13", 5, false),
  // Boulder — Tuesday 2026-07-14
  visit(1, "2026-07-14", 1),
  visit(1, "2026-07-14", 6, false),
  // Boulder — Wednesday 2026-07-15 (planning only, nobody confirmed)
  visit(1, "2026-07-15", 3, false),
  visit(1, "2026-07-15", 9, false),
  // Boulder — Thursday 2026-07-16
  visit(1, "2026-07-16", 3),
  visit(1, "2026-07-16", 4),
  visit(1, "2026-07-16", 5),
  visit(1, "2026-07-16", 6, false),
  visit(1, "2026-07-16", 7, false),
  visit(1, "2026-07-16", 2),
  // Boulder — Friday 2026-07-17
  visit(1, "2026-07-17", 6),
  visit(1, "2026-07-17", 4),
  visit(1, "2026-07-17", 5, false),
  visit(1, "2026-07-17", 2),
  visit(1, "2026-07-17", 7, false),

  // Falls Church — Monday 2026-07-13
  visit(2, "2026-07-13", 11),
  visit(2, "2026-07-13", 12, false),
  // Falls Church — Tuesday 2026-07-14
  visit(2, "2026-07-14", 11),
  visit(2, "2026-07-14", 14, false),
  visit(2, "2026-07-14", 15),
  // Falls Church — Wednesday 2026-07-15
  visit(2, "2026-07-15", 13),
  // Falls Church — Thursday 2026-07-16
  visit(2, "2026-07-16", 11),
  visit(2, "2026-07-16", 12),
  visit(2, "2026-07-16", 14, false),
  visit(2, "2026-07-16", 15),
  visit(2, "2026-07-16", 16),
  visit(2, "2026-07-16", 17, false),
  visit(2, "2026-07-16", 18),
  visit(2, "2026-07-16", 19, false),
  visit(2, "2026-07-16", 20),
  // Falls Church — Friday 2026-07-17
  visit(2, "2026-07-17", 13),
  visit(2, "2026-07-17", 16, false),
  visit(2, "2026-07-17", 20),
];

// The office switcher works in slugs (`office.id`), but the mock data is keyed
// by the numeric `office_id` the API uses. Only Boulder and Falls Church have
// mock rosters; every other slug falls back to the default office.
const MOCK_OFFICE_ID_BY_SLUG: Record<string, number> = {
  boulder: 1,
  "falls-church": 2,
};

export function mockOfficeId(slug: string): number {
  return MOCK_OFFICE_ID_BY_SLUG[slug] ?? DEFAULT_OFFICE_ID;
}

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
 * Builds the `WeekSchedule` the calendar consumes from the mock users/visits,
 * applying the attendance mapping documented at the top of this file:
 *   - a confirmed visit        → "confirmed-yes"
 *   - a tentative visit, or the user's `default_schedule` weekday → "planning-yes"
 *   - neither                  → "planning-no" (out)
 */
export function officeSchedule(
  officeId: number,
  weekDates: Date[],
): WeekSchedule {
  const roster = MOCK_USERS.filter((user) => user.office_id === officeId);
  const schedule: WeekSchedule = {};

  for (const date of weekDates) {
    const key = toDateKey(date);
    const weekday = WEEKDAY_FIELDS[date.getDay()];

    schedule[key] = roster.map((user): PersonStatus => {
      const visit = MOCK_VISITS.find(
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
