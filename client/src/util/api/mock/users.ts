import type { User } from "@/types/api/users";

/**
 * Mock roster, shaped exactly like the `/users` response the API will expose
 * once the endpoint exists, so `getUsers` can swap the resolved mock for a real
 * fetch without touching any consumer.
 *
 *   - `MOCK_USERS` mirrors `UserSerializer` (with the nested `default_schedule`
 *     from `ScheduleSerializer`).
 *
 * See `@/util/api/mock/visits` for how attendance maps onto users + visits.
 */

/** The `{ status, data }` envelope the real roster endpoint will return. */
export interface MockUsersResponse {
  status: { message: string };
  data: { users: User[] };
}

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

// Real API office ids (see GET /api/v1/offices). The mock roster only populates
// these two offices; every other office comes back empty until the real roster
// endpoint exists.
export const BOULDER_OFFICE_ID = 2;
export const FALLS_CHURCH_OFFICE_ID = 3;

export const MOCK_USERS: User[] = [
  // Boulder
  {
    id: 1,
    email: "jackson.f@example.com",
    first_name: "Jackson",
    last_name: "F",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(1, [true, true, false, false, true]),
  },
  {
    id: 2,
    email: "abby.s@example.com",
    first_name: "Abby",
    last_name: "S",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(2, [true, false, false, true, true]),
  },
  {
    id: 3,
    email: "natalie.d@example.com",
    first_name: "Natalie",
    last_name: "D",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(3, [true, false, true, true, false]),
  },
  {
    id: 4,
    email: "tommy.b@example.com",
    first_name: "Tommy",
    last_name: "B",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(4, [false, false, false, true, true]),
  },
  {
    id: 5,
    email: "laura.l@example.com",
    first_name: "Laura",
    last_name: "L",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(5, [true, true, false, true, true]),
  },
  {
    id: 6,
    email: "blair.c@example.com",
    first_name: "Blair",
    last_name: "C",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(6, [false, true, false, true, true]),
  },
  {
    id: 7,
    email: "jeremy.f@example.com",
    first_name: "Jeremy",
    last_name: "F",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(7, [false, false, false, true, true]),
  },
  {
    id: 8,
    email: "sam.p@example.com",
    first_name: "Sam",
    last_name: "P",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(8, [false, true, true, true, false]),
  },
  {
    id: 9,
    email: "riley.k@example.com",
    first_name: "Riley",
    last_name: "K",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(9, [true, false, true, false, true]),
  },
  {
    id: 10,
    email: "morgan.t@example.com",
    first_name: "Morgan",
    last_name: "T",
    office_id: BOULDER_OFFICE_ID,
    default_schedule: weekdaySchedule(10, [false, true, false, false, false]),
  },
  // Falls Church
  {
    id: 11,
    email: "priya.n@example.com",
    first_name: "Priya",
    last_name: "N",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(11, [true, true, false, true, false]),
  },
  {
    id: 12,
    email: "devon.w@example.com",
    first_name: "Devon",
    last_name: "W",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(12, [true, false, true, true, false]),
  },
  {
    id: 13,
    email: "casey.m@example.com",
    first_name: "Casey",
    last_name: "M",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(13, [true, false, true, false, true]),
  },
  {
    id: 14,
    email: "harper.g@example.com",
    first_name: "Harper",
    last_name: "G",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(14, [false, true, false, true, false]),
  },
  {
    id: 15,
    email: "xavier.r@example.com",
    first_name: "Xavier",
    last_name: "R",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(15, [false, true, false, true, false]),
  },
  {
    id: 16,
    email: "nina.q@example.com",
    first_name: "Nina",
    last_name: "Q",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(16, [true, false, false, true, true]),
  },
  {
    id: 17,
    email: "owen.v@example.com",
    first_name: "Owen",
    last_name: "V",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(17, [false, false, true, true, true]),
  },
  {
    id: 18,
    email: "bianca.t@example.com",
    first_name: "Bianca",
    last_name: "T",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(18, [false, true, false, true, false]),
  },
  {
    id: 19,
    email: "felix.j@example.com",
    first_name: "Felix",
    last_name: "J",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(19, [false, true, false, true, false]),
  },
  {
    id: 20,
    email: "zara.h@example.com",
    first_name: "Zara",
    last_name: "H",
    office_id: FALLS_CHURCH_OFFICE_ID,
    default_schedule: weekdaySchedule(20, [false, false, true, true, true]),
  },
];

export const mockUsersResponse: MockUsersResponse = {
  status: { message: "Fetched users successfully" },
  data: { users: MOCK_USERS },
};
