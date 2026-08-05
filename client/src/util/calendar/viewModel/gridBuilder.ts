import type {
  OfficeDatesPlanningOverrideStates,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";
import type { RosterUser } from "@/types/calendar/calendar";
import type { CalendarScheduleEntry, WeekSchedule } from "@/types/calendar/schedule/weekSchedule";
import { userDisplayName } from "@/util/auth/displayName";
import {
  baseAttendanceForUser,
  planningOverrideStateForUser,
  resolveAttendance,
  resolveEditingAttendance,
} from "@/util/cable/planning/overrideState";
import { addDays, generateDateKey, isSameDay } from "@/util/dates/date";

export const WEEKDAYS_PER_WEEK = 5;

export interface CalendarGridViewModel {
  days: CalendarDayViewModel[];
  todayIndex: number | null;
  locked: boolean;
}

export interface CalendarDayViewModel {
  key: string;
  date: Date;
  rosterUsers: RosterUser[];
  currentUserSelected: boolean;
  visitorCount: number;
  isHotSpot: boolean;
  isConfirmedElsewhere: boolean;
  externalOfficeName: string;
  externalOfficeEmoji: string;
}

interface BuildCalendarGridViewModelInput {
  focusedWeekStart: Date;
  schedule: WeekSchedule;
  planningByDate: OfficeDatesPlanningOverrideStates;
  currentUserId: number;
  editingUserIds: ReadonlySet<number>;
  externalOfficeNamesByDate: ReadonlyMap<string, string>;
  externalOfficeEmojisByDate: ReadonlyMap<string, string>;
  locked: boolean;
  today?: Date;
}

interface BaseCalendarDay {
  key: string;
  date: Date;
  rosterUsers: RosterUser[];
  confirmedCount: number;
  planningCount: number;
  isConfirmedElsewhere: boolean;
}

export function buildCalendarGridViewModel({
  focusedWeekStart,
  schedule,
  planningByDate,
  currentUserId,
  editingUserIds,
  externalOfficeNamesByDate,
  externalOfficeEmojisByDate,
  locked,
  today = new Date(),
}: BuildCalendarGridViewModelInput): CalendarGridViewModel {
  const baseDays: BaseCalendarDay[] = Array.from(
    { length: WEEKDAYS_PER_WEEK },
    (_, index) => {
      const date = addDays(focusedWeekStart, index);
      const key = generateDateKey(date);
      const calendarEntries: CalendarScheduleEntry[] = schedule[key] ?? [];

      const currentUser = calendarEntries.find(
        (entry) => entry.user.id === currentUserId
      );

      const isConfirmedElsewhere = currentUser?.status === "confirmed-elsewhere";

      return {
        key,
        date,
        calendarEntries,
        confirmedCount: countConfirmedPeople(calendarEntries),
        planningCount: countPlanningPeople(calendarEntries),
        isConfirmedElsewhere,
      };
    },
  );

  const hotSpotIndexes = findHotSpotIndexes(baseDays);

  const days: CalendarDayViewModel[] = baseDays.map((day, index) => ({
    key: day.key,
    date: day.date,
    rosterUsers: day.rosterUsers,
    currentUserSelected:
      !day.isConfirmedElsewhere &&
      isCurrentUserSelected(day.rosterUsers, currentUserId),
    visitorCount: countConfirmedVisitors(day.rosterUsers),
    isHotSpot: hotSpotIndexes.has(index) && !day.isConfirmedElsewhere,
    isConfirmedElsewhere: day.isConfirmedElsewhere,
    externalOfficeName: externalOfficeNamesByDate.get(day.key) ?? "",
    externalOfficeEmoji: externalOfficeEmojisByDate.get(day.key) ?? "",
  }));

  const todayIndex = days.findIndex((day) => isSameDay(day.date, today));

  return {
    days,
    todayIndex: todayIndex === -1 ? null : todayIndex,
    locked,
  };
}

// function resolveRosterUsers(
//   calendarEntries: CalendarScheduleEntry[],
//   overrides: TogglePlanningOverrideState | undefined,
//   editingUserIds: ReadonlySet<number>,
// ): RosterUser[] {
//   const resolvedRosterUsers = calendarEntries.map((rosterUser): RosterUser => {
//     if (rosterUser.status === "confirmed-elsewhere") {
//       return rosterUser;
//     }
//
//     const { hasConfirmedVisit, isDefaultScheduleDay } = baseAttendanceForUser({
//       day: calendarEntries,
//       userId: rosterUser.userId,
//     });
//
//     const isEditing = editingUserIds.has(rosterUser.userId);
//     const hasConfirmedWeekStatus =
//       rosterUser.status === "confirmed-yes" ||
//       rosterUser.status === "confirmed-no";
//
//     if (!isEditing && hasConfirmedWeekStatus) {
//       return rosterUser;
//     }
//
//     const planningOverrideState = planningOverrideStateForUser(
//       overrides,
//       rosterUser.userId,
//     );
//
//     const attending = isEditing
//       ? resolveEditingAttendance({
//           hasConfirmedVisit,
//           planningOverrideState,
//         })
//       : resolveAttendance({
//           hasConfirmedVisit,
//           planningOverrideState,
//           isDefaultScheduleDay,
//         });
//
//     return {
//       ...rosterUser,
//       status: attending ? "planning-yes" : "planning-no",
//     };
//   });
//
//   const rosterUserIds = new Set(
//     rosterUsers.map((rosterUser) => rosterUser.userId),
//   );
//
//   const additionalSelectedUsers =
//     overrides?.selected
//       .filter(
//         (planningUser: ChannelSerializedUser) =>
//           !rosterUserIds.has(planningUser.id),
//       )
//       .map((planningUser: ChannelSerializedUser): RosterUser => ({
//         userId: planningUser.id,
//         name: userDisplayName(planningUser),
//         status: "planning-yes",
//         isVisitor: false,
//       })) ?? [];
//
//   return [...additionalSelectedUsers, ...resolvedRosterUsers];
// }

function countConfirmedPeople(entries: CalendarScheduleEntry[]): number {
  return entries.filter((entry) => entry.status === "confirmed-yes").length;
}

function countPlanningPeople(entries: CalendarScheduleEntry[]): number {
  return entries.filter((entry) => entry.status === "planning-yes").length;
}

function countConfirmedVisitors(people: RosterUser[]): number {
  return people.filter(
    (person) => person.status === "confirmed-yes" && person.isVisitor,
  ).length;
}

function isCurrentUserSelected(
  people: RosterUser[],
  currentUserId: number,
): boolean {
  return people.some(
    (person) =>
      person.userId === currentUserId &&
      (person.status === "confirmed-yes" || person.status === "planning-yes"),
  );
}

interface HotSpotCandidate {
  confirmedCount: number;
  planningCount: number;
}

function findHotSpotIndexes(days: HotSpotCandidate[]): Set<number> {
  const indexes = new Set<number>();

  const maximumConfirmedCount = Math.max(
    0,
    ...days.map((day) => day.confirmedCount),
  );

  if (maximumConfirmedCount === 0) {
    return indexes;
  }

  const topConfirmedIndexes = days
    .map((_, index) => index)
    .filter((index) => days[index].confirmedCount === maximumConfirmedCount);

  const maximumPlanningCount = Math.max(
    ...topConfirmedIndexes.map((index) => days[index].planningCount),
  );

  for (const index of topConfirmedIndexes) {
    if (days[index].planningCount === maximumPlanningCount) {
      indexes.add(index);
    }
  }

  return indexes;
}
