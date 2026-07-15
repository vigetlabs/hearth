import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import {
  BOULDER_OFFICE_ID,
  FALLS_CHURCH_OFFICE_ID,
  MOCK_USERS,
} from "@/util/api/mock/users";

/**
 * Mock visits for the sample week, shaped like the `/visits` response so
 * `getVisits` can swap the resolved mock for a real fetch without touching any
 * consumer.
 *
 * How attendance maps onto users + visits, matching the real models:
 *   - "Confirmed in" for a date  → a `Visit` record with `is_confirmed: true`.
 *   - "Planning/maybe in"        → a `Visit` record with `is_confirmed: false`
 *                                  (a tentative RSVP), or the user's
 *                                  `default_schedule` has that weekday set with
 *                                  no visit yet.
 *   - "Out"                      → neither.
 */

/** The user serializer nests only these fields on each visit. */
type VisitUser = Pick<User, "id" | "first_name" | "last_name">;

/**
 * The visit serializer returns `office_id` and a concrete `user` object (typed
 * `unknown` upstream). `is_confirmed` is not on the serializer yet but models
 * the tentative-vs-locked-in split the calendar needs; regenerate the OpenAPI
 * schema and drop these locals once the API exposes it.
 */
export type MockVisit = Omit<Visit, "user"> & {
  office_id: number;
  is_confirmed: boolean;
  user: VisitUser;
};

/** The `{ status, data }` envelope the visits endpoint returns. */
export interface MockVisitsResponse {
  status: { message: string };
  data: { visits: MockVisit[] };
}

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
  visit(BOULDER_OFFICE_ID, "2026-07-13", 1),
  visit(BOULDER_OFFICE_ID, "2026-07-13", 2),
  visit(BOULDER_OFFICE_ID, "2026-07-13", 5, false),
  // Boulder — Tuesday 2026-07-14
  visit(BOULDER_OFFICE_ID, "2026-07-14", 1),
  visit(BOULDER_OFFICE_ID, "2026-07-14", 6, false),
  // Boulder — Wednesday 2026-07-15 (planning only, nobody confirmed)
  visit(BOULDER_OFFICE_ID, "2026-07-15", 3, false),
  visit(BOULDER_OFFICE_ID, "2026-07-15", 9, false),
  // Boulder — Thursday 2026-07-16
  visit(BOULDER_OFFICE_ID, "2026-07-16", 3),
  visit(BOULDER_OFFICE_ID, "2026-07-16", 4),
  visit(BOULDER_OFFICE_ID, "2026-07-16", 5),
  visit(BOULDER_OFFICE_ID, "2026-07-16", 6, false),
  visit(BOULDER_OFFICE_ID, "2026-07-16", 7, false),
  visit(BOULDER_OFFICE_ID, "2026-07-16", 2),
  // Boulder — Friday 2026-07-17
  visit(BOULDER_OFFICE_ID, "2026-07-17", 6),
  visit(BOULDER_OFFICE_ID, "2026-07-17", 4),
  visit(BOULDER_OFFICE_ID, "2026-07-17", 5, false),
  visit(BOULDER_OFFICE_ID, "2026-07-17", 2),
  visit(BOULDER_OFFICE_ID, "2026-07-17", 7, false),

  // Falls Church — Monday 2026-07-13
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-13", 11),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-13", 12, false),
  // Falls Church — Tuesday 2026-07-14
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-14", 11),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-14", 14, false),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-14", 15),
  // Falls Church — Wednesday 2026-07-15
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-15", 13),
  // Falls Church — Thursday 2026-07-16
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 11),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 12),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 14, false),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 15),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 16),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 17, false),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 18),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 19, false),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-16", 20),
  // Falls Church — Friday 2026-07-17
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-17", 13),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-17", 16, false),
  visit(FALLS_CHURCH_OFFICE_ID, "2026-07-17", 20),
];

export const mockVisitsResponse: MockVisitsResponse = {
  status: { message: "Fetched visits successfully" },
  data: { visits: MOCK_VISITS },
};
