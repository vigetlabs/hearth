import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type { OfficeDatesPlanningOverrideStates } from "@/types/cable/officePlanning";
import type { CalendarScheduleEntry, WeekSchedule } from "@/types/calendar/schedule/weekSchedule";
import { findUserVisitsOnDate, hasExternalVisit, hasVisitAtOffice } from "./visitsFilter";
import { isDefaultScheduleDay } from "./scheduleFilter";
import { planningOverrideStateForUser } from "@/util/cable/planning/overrideState";
import { resolveAttendanceMode } from "./modeFilter";
import type { CalendarDateAttendanceFacts } from "@/types/calendar/attendance/attendanceFacts";
import { resolveAttendanceStatus } from "../attendance/attendanceStatusResolver";
import type { CalendarAttendanceResolution } from "@/types/calendar/attendance/attendanceRules";


interface BuildWeekScheduleInput {
  officeUsers: User[];
  officeVisits: Visit[];
  weekDateKeys: readonly string[];
  confirmedUserIds: ReadonlySet<number>;
  editingUserIds: ReadonlySet<number>;
  planningStatesByDate: OfficeDatesPlanningOverrideStates
  activeOfficeId: number
}

export function buildWeekSchedule({
  officeUsers,
  officeVisits,
  weekDateKeys,
  confirmedUserIds,
  editingUserIds,
  planningStatesByDate,
  activeOfficeId
}: BuildWeekScheduleInput) {
  const schedule: WeekSchedule = {};

  for (const dateKey of weekDateKeys) {
    const entries: CalendarScheduleEntry[] = [];

    for (const user of officeUsers) {
      const facts = buildCalendarFacts({
        officeVisits,
        confirmedUserIds,
        editingUserIds,
        planningStatesByDate,
        activeOfficeId,
        dateKey,
        user
      });

      const resolution: CalendarAttendanceResolution = resolveAttendanceStatus(facts);

      entries.push({
        user,
        status: resolution.status,
        resolvedBy: resolution.matchedRule
      });
    }
    schedule[dateKey] = entries;
  }
  return schedule
}

interface BuildCalendarFactsInput {
  officeVisits: Visit[],
  confirmedUserIds: ReadonlySet<number>;
  editingUserIds: ReadonlySet<number>;
  planningStatesByDate: OfficeDatesPlanningOverrideStates,
  activeOfficeId: number,
  dateKey: string,
  user: User
}

function buildCalendarFacts({
  officeVisits,
  confirmedUserIds,
  editingUserIds,
  planningStatesByDate,
  activeOfficeId,
  dateKey,
  user
}: BuildCalendarFactsInput): CalendarDateAttendanceFacts {
  const userVisitsOnDate = findUserVisitsOnDate(
    dateKey,
    user.id,
    officeVisits
  );

  const userHasVisitHere: boolean = hasVisitAtOffice(
    userVisitsOnDate,
    activeOfficeId
  );

  const userHasExternalVisit: boolean = hasExternalVisit(
    userVisitsOnDate,
    activeOfficeId
  );

  const defaultScheduled: boolean = isDefaultScheduleDay(
    user,
    new Date(dateKey)
  );

  const planningOverrideForDate = planningOverrideStateForUser(
    planningStatesByDate[dateKey],
    user.id
  );

  const mode = resolveAttendanceMode({
    isEditing: editingUserIds.has(user.id),
    isConfirmed: confirmedUserIds.has(user.id)
  });

  return {
    mode: mode,
    hasVisitHere: userHasVisitHere,
    hasVisitElsewhere: userHasExternalVisit,
    defaultScheduled: defaultScheduled,
    planningOverride: planningOverrideForDate
  }
}

interface FindAllUsersForDateAndOffice {
  officeUsers: User[],
  officeVisits: Visit[],
  planningStatesByDate: OfficeDatesPlanningOverrideStates,
  activeOfficeId: number,
  dateKey: string
}

function findAllUsersForDateAndOffice({
  officeUsers,
  officeVisits,
  planningStatesByDate,
  activeOfficeId,
  dateKey
}: FindAllUsersForDateAndOffice) {

  const usersById = new Map<number, User>(
    officeUsers.map((user): [number, User] => [user.id, user]),
  );

  for (const user of officeUsers) {
    usersById.set(user.id, user);
  }

  for (const visit of officeVisits) {
    usersById.set(visit.user.id, visit.user)
  }

  const selectedPlanningUsers =
    planningStatesByDate[dateKey]?.selected ?? [];

  for (const user of selectedPlanningUsers) {
    usersById.set(user.id, user);
  }
}
