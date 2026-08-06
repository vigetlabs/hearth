import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type { OfficeDatesPlanningOverrideStates } from "@/types/cable/officePlanning";
import type { CalendarDateAttendanceFacts } from "@/types/calendar/attendance/attendanceFacts";
import type { CalendarAttendanceResolution } from "@/types/calendar/attendance/attendanceRules";
import type {
  CalendarScheduleEntry,
  WeekSchedule,
} from "@/types/calendar/schedule/weekSchedule";
import { planningOverrideStateForUser } from "@/util/cable/planning/overrideState";
import { resolveAttendanceStatus } from "../attendance/attendanceStatusResolver";
import { resolveAttendanceMode } from "./modeFilter";
import { isDefaultScheduleDay } from "./scheduleFilter";
import { findUserVisitsOnDate } from "./visitsFilter";

type ScheduleOffice = Pick<Office, "id" | "name" | "emoji">;

interface BuildWeekScheduleInput {
  officeUsers: User[];
  relevantVisits: Visit[];
  officesById: ReadonlyMap<number, ScheduleOffice>;
  weekDateKeys: readonly string[];
  confirmedUserIds: ReadonlySet<number>;
  editingUserIds: ReadonlySet<number>;
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  activeOfficeId: number;
  currentUserId: number;
}

export function buildWeekSchedule({
  officeUsers,
  relevantVisits,
  officesById,
  weekDateKeys,
  confirmedUserIds,
  editingUserIds,
  planningStatesByDate,
  activeOfficeId,
  currentUserId
}: BuildWeekScheduleInput): WeekSchedule {
  const schedule: WeekSchedule = {};

  for (const dateKey of weekDateKeys) {
    const entries: CalendarScheduleEntry[] = [];

    const users = findAllUsersForDateAndOffice({
      officeUsers,
      relevantVisits,
      planningStatesByDate,
      activeOfficeId,
      dateKey,
      currentUserId
    });

    for (const user of users) {
      const userVisitsOnDate = findUserVisitsOnDate(
        dateKey,
        user.id,
        relevantVisits,
      );

      const visitHere = userVisitsOnDate.find(
        (visit) => visit.office_id === activeOfficeId,
      );

      const externalVisit = userVisitsOnDate.find(
        (visit) => visit.office_id !== activeOfficeId,
      );

      const facts = buildCalendarFacts({
        user,
        userVisitsOnDate,
        confirmedUserIds,
        editingUserIds,
        planningStatesByDate,
        activeOfficeId,
        dateKey,
      });

      const resolution: CalendarAttendanceResolution =
        resolveAttendanceStatus(facts);

      const externalOffice =
        resolution.status === "confirmed-elsewhere" && externalVisit
          ? officesById.get(externalVisit.office_id) ?? null
          : null;

      entries.push({
        user,
        status: resolution.status,
        resolvedBy: resolution.matchedRule,
        isVisitor:
          visitHere !== undefined &&
          user.office?.id !== activeOfficeId,
        externalOffice,
      });
    }

    schedule[dateKey] = entries;
  }

  return schedule;
}

interface BuildCalendarFactsInput {
  user: User;
  userVisitsOnDate: Visit[];
  confirmedUserIds: ReadonlySet<number>;
  editingUserIds: ReadonlySet<number>;
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  activeOfficeId: number;
  dateKey: string;
}

function buildCalendarFacts({
  user,
  userVisitsOnDate,
  confirmedUserIds,
  editingUserIds,
  planningStatesByDate,
  activeOfficeId,
  dateKey,
}: BuildCalendarFactsInput): CalendarDateAttendanceFacts {
  const hasVisitHere = userVisitsOnDate.some(
    (visit) => visit.office_id === activeOfficeId,
  );

  const hasVisitElsewhere = userVisitsOnDate.some(
    (visit) => visit.office_id !== activeOfficeId,
  );

  const defaultScheduled = isDefaultScheduleDay(
    user,
    new Date(`${dateKey}T00:00:00`),
  );

  const planningOverride = planningOverrideStateForUser(
    planningStatesByDate[dateKey],
    user.id,
  );

  const mode = resolveAttendanceMode({
    isEditing: editingUserIds.has(user.id),
    isConfirmed: confirmedUserIds.has(user.id),
  });

  return {
    mode,
    hasVisitHere,
    hasVisitElsewhere,
    defaultScheduled,
    planningOverride,
  };
}

interface FindAllUsersForDateAndOfficeInput {
  officeUsers: User[];
  relevantVisits: Visit[];
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  activeOfficeId: number;
  dateKey: string;
  currentUserId: number;
}

function findAllUsersForDateAndOffice({
  officeUsers,
  relevantVisits,
  planningStatesByDate,
  activeOfficeId,
  dateKey,
  currentUserId
}: FindAllUsersForDateAndOfficeInput): User[] {
  const usersById = new Map<number, User>(
    officeUsers.map((user) => [user.id, user]),
  );

  for (const visit of relevantVisits) {
    if (visit.visit_date !== dateKey) {
      continue;
    }

    const isVistingActiveOffice =
      visit.office_id === activeOfficeId
    // if (
    //   visit.visit_date === dateKey &&
    //   visit.office_id === activeOfficeId
    // ) {
    //   usersById.set(visit.user.id, visit.user);
    // }
    const isCurrentUserVisit =
      visit.user.id === currentUserId

    if (isVistingActiveOffice || isCurrentUserVisit) {
      usersById.set(visit.user.id, visit.user);
    }
  }

  const selectedPlanningUsers =
    planningStatesByDate[dateKey]?.selected ?? [];

  for (const user of selectedPlanningUsers) {
    usersById.set(user.id, user);
  }

  return [...usersById.values()];
}
