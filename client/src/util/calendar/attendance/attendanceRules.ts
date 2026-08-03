import type { CalendarDateAttendanceFacts as Facts} from "@/types/calendar/attendance/attendanceFacts";
import type { CalendarAttendanceRule } from "@/types/calendar/attendance/attendanceRules";

/*
 * The rule table is as follows:
 *
 * 1. External visits take precedence. If the current user already has a persisted visit at another office, show that
 * before considering anything else.
 *
 * 2. A persisted visit at the active office is confirmed attendance. If the user has a database visit at the active
 * office defined in the scope, then a user appears as confirmed-yes. Because this rule appears looking at overrides,
 * a persisted visit always returns "confirmed-yes".
 *
 * 3. Confirmedmode converts missing visits into confirmed absence. Since persisted-visit comes first, reaching this rule
 * implies that the user is confirmed and has no persisted visit, thus confirmed-no
 *
 * 4-5. Redis overrides modify planning/editing attendance. A live Redis override is more recent than the basline schedule
 */

export const ATTENDANCE_RULES = [
  {
    id: "external-visit",
    matches: (facts: Facts) => facts.hasVisitElsewhere,
    status: "confirmed-elsewhere"
  },
  {
    id: "persisted-visit",
    matches: (facts: Facts) => facts.hasVisitHere,
    status: "confirmed-yes"
  },
  {
    id: "confirmed-absence",
    matches: (facts: Facts) => facts.mode === "confirmed",
    status: "confirmed-no"
  },
  {
    id: "selected-override",
    matches: (facts: Facts) => facts.planningOverride === "selected",
    status: "planning-yes"
  },
  {
    id: "deselected-override",
    matches: (facts: Facts) => facts.planningOverride === "deselected",
    status: "planning-no"
  },
  // {
  //   id: "editing-visit",
  //   matches: (facts: Facts) => facts.mode === "editing" && facts.hasVisitHere,
  //   status: "planning-yes"
  // },
  // {
  //   id: "editing-absence",
  //   matches: (facts: Facts) => facts.mode === "editing",
  //   status: "planning-no"
  // },
  // {
  //   id: "default-schedule",
  //   matches: (facts: Facts) => facts.defaultScheduled,
  //   status: "confirmed-elsewhere"
  // },
  // {
  //   id: "default-schedule",
  //   matches: () => true,
  //   status: "confirmed-elsewhere"
  // },
] satisfies readonly CalendarAttendanceRule[];
