import type { Visit } from "@/types/api/visits";
import type { ChannelSerializedUser, OfficeDatesPlanningOverrideStates, TogglePlanningOverrideState } from "@/types/cable/officePlanning";
import type { RosterUser, WeekSchedule } from "@/types/calendar/calendar";
import { generateDateKey } from "@/util/dates/date";

interface BuildSelectedDatesOptions {
  userId: number;
  weekDates: readonly Date[];
  schedule: WeekSchedule;
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  externalVisitsByDate: ReadonlyMap<string, Visit>
}

export function buildSelectedDatesBootstrap({
  userId,
  weekDates,
  schedule,
  planningStatesByDate,
  externalVisitsByDate
}: BuildSelectedDatesOptions): string[] {
  return weekDates
    .filter((date: Date) => {
      const dateKey: string = generateDateKey(date);

      if (externalVisitsByDate.has(dateKey)) {
        return false;
      }

      const rosterUsers: RosterUser[] = schedule[dateKey] ?? [];

      const curRosterUser = rosterUsers.find(
        (rosterUser) => rosterUser.userId === userId
      );

      const planningState: TogglePlanningOverrideState | undefined = 
        planningStatesByDate[dateKey];

      const userSelectedDate: boolean =
        containsPlanningUser(
          planningState?.selected ?? [],
          userId
        );

      if (userSelectedDate) {
        return true;
      };

      const userDeselectedDate: boolean =
        containsPlanningUser(
          planningState?.deselected ?? [],
          userId
        );

      if (userDeselectedDate) {
        return false;
      };

      return (
        curRosterUser?.status === "planning-yes" ||
        curRosterUser?.status === "confirmed-yes"
      );
    })
    .map(generateDateKey);
}

function containsPlanningUser(
  users: readonly ChannelSerializedUser[],
  userId: number
): boolean {
  return users.some(
    (planningUser) => planningUser.id === userId
  );
}
