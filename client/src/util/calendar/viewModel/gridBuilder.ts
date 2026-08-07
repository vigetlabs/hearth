import type { OfficeDatesPlanningOverrideStates } from "@/types/cable/officePlanning";
import type {
  CalendarScheduleEntry,
  WeekSchedule,
} from "@/types/calendar/schedule/weekSchedule";
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
  entries: CalendarScheduleEntry[];
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
  entries: CalendarScheduleEntry[];
  confirmedCount: number;
  planningCount: number;
  isConfirmedElsewhere: boolean;
  externalOfficeName: string;
  externalOfficeEmoji: string;
}

export function buildCalendarGridViewModel({
  focusedWeekStart,
  schedule,
  currentUserId,
  locked,
  today = new Date(),
}: BuildCalendarGridViewModelInput): CalendarGridViewModel {
  const baseDays: BaseCalendarDay[] = Array.from(
    { length: WEEKDAYS_PER_WEEK },
    (_, index) => {
      const date = addDays(focusedWeekStart, index);
      const key = generateDateKey(date);
      const calendarEntries: CalendarScheduleEntry[] = schedule[key] ?? [];

      const currentUserEntry = calendarEntries.find(
        (entry) => entry.user.id === currentUserId,
      );

      const isConfirmedElsewhere =
        currentUserEntry?.status === "confirmed-elsewhere";

      return {
        key,
        date,
        entries: calendarEntries,
        confirmedCount: countConfirmedPeople(calendarEntries),
        planningCount: countPlanningPeople(calendarEntries),
        isConfirmedElsewhere,
        externalOfficeName: isConfirmedElsewhere
          ? (currentUserEntry.externalOffice?.name ?? "")
          : "",
        externalOfficeEmoji: isConfirmedElsewhere
          ? (currentUserEntry.externalOffice?.emoji ?? "")
          : "",
      };
    },
  );

  const hotSpotIndexes = findHotSpotIndexes(baseDays);

  const days: CalendarDayViewModel[] = baseDays.map((day, index) => ({
    key: day.key,
    date: day.date,
    entries: day.entries,
    currentUserSelected:
      !day.isConfirmedElsewhere &&
      isCurrentUserSelected(day.entries, currentUserId),
    visitorCount: countConfirmedVisitors(day.entries),
    isHotSpot: hotSpotIndexes.has(index) && !day.isConfirmedElsewhere,
    isConfirmedElsewhere: day.isConfirmedElsewhere,
    externalOfficeName: day.externalOfficeName,
    externalOfficeEmoji: day.externalOfficeEmoji,
  }));

  const todayIndex = days.findIndex((day) => isSameDay(day.date, today));

  return {
    days,
    todayIndex: todayIndex === -1 ? null : todayIndex,
    locked,
  };
}

function countConfirmedPeople(entries: CalendarScheduleEntry[]): number {
  return entries.filter((entry) => entry.status === "confirmed-yes").length;
}

function countPlanningPeople(entries: CalendarScheduleEntry[]): number {
  return entries.filter((entry) => entry.status === "planning-yes").length;
}

function countConfirmedVisitors(entries: CalendarScheduleEntry[]): number {
  return entries.filter(
    (entry) => entry.status === "confirmed-yes" && entry.isVisitor,
  ).length;
}

function isCurrentUserSelected(
  entries: CalendarScheduleEntry[],
  currentUserId: number,
): boolean {
  return entries.some(
    (entry) =>
      entry.user.id === currentUserId &&
      (entry.status === "confirmed-yes" || entry.status === "planning-yes"),
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
