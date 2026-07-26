import { DayCell } from "@/components/Calendar/DayCell";

import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
import type { RosterUser, WeekSchedule } from "@/types/calendar/calendar";
import type {
  ChannelSerializedUser,
  OfficeDatesPlanningOverrideStates,
  PlanningOverrideState,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";

import { isInOffice } from "@/types/calendar/calendar";
import { userDisplayName } from "@/util/auth/displayName";
import { generateDateKey, isSameDay } from "@/util/dates/date";

import {
  baseAttendanceForUser,
  planningOverrideStateForUser,
  resolveAttendance,
  resolveEditingAttendance,
} from "@/util/cable/planning/overrideState";
import { useCalendarMachine } from "@/util/calendar/MachineProvider";
import { getCapabilitiesFor } from "@/util/calendar/machineCapabilities";
import type { CalendarMachineCapabilities } from "@/types/calendar/machineCapabilities";
import { isDateEditableState } from "@/util/calendar/machineGuards";
import { rosterStatusForMachineDate, selectedDatesForMachine } from "@/util/calendar/stateSelectors";

const WEEKDAYS_PER_WEEK = 5;
const EMPTY_DAY: RosterUser[] = [];

// The "Most confirmed" hot spot is about the busiest day overall, so it counts
// everyone confirmed in — this is intentionally independent of the visitor
// badge, which counts only confirmed visitors from other offices.
const confirmedCountOf = (day: RosterUser[]): number =>
  day.filter((person) => person.status === "confirmed-yes").length;

const visitorCountOf = (day: RosterUser[]): number =>
  day.filter((person) => person.status === "confirmed-yes" && person.isVisitor)
    .length;

interface CalendarProps {
  schedule: WeekSchedule;
  office: Office;
  days: readonly Date[];
  locked: boolean;
  user: User;
  planningByDate: OfficeDatesPlanningOverrideStates;
  isPlanningConnected: boolean;
  onPlanningToggle: (date: string, attending: boolean) => void;
  currentUserExternalVisitsByDate: ReadonlyMap<string, Visit>;
  externalOfficeNamesByDate: ReadonlyMap<string, string>;
  editingUserIds: ReadonlySet<number>;
  externalOfficeEmojisByDate: ReadonlyMap<string, string>;
}

export function Calendar({
  schedule,
  office,
  days,
  locked,
  user,
  planningByDate,
  isPlanningConnected,
  onPlanningToggle,
  currentUserExternalVisitsByDate,
  externalOfficeNamesByDate,
  editingUserIds,
  externalOfficeEmojisByDate,
}: CalendarProps) {
  const myName = userDisplayName(user);

  const { state: machineState, dispatch: machineDispatch } = useCalendarMachine();

  const capabilities: CalendarMachineCapabilities = getCapabilitiesFor(machineState);

  const machineSelectedDates = selectedDatesForMachine(machineState);

  function getDayData(key: string): RosterUser[] {
    const rosterUsers = schedule[key] ?? EMPTY_DAY;

    const overrides: TogglePlanningOverrideState = planningByDate[key];

    const resolvedScheduledPeople = rosterUsers.map(
      (rosterUser): RosterUser => {
        if (rosterUser.status === "confirmed-elsewhere") {
          return rosterUser;
        }

        //current user branch
        if (rosterUser.userId === user.id) {
          return {
            ...rosterUser,
            status: rosterStatusForMachineDate(machineState, key)
          }
        }

        //other user branch

        const { hasConfirmedVisit, isDefaultScheduleDay } =
          baseAttendanceForUser({
            day: rosterUsers,
            userId: rosterUser.userId,
          });

        const planningOverrideState: PlanningOverrideState =
          planningOverrideStateForUser(overrides, rosterUser.userId);

        const isEditing = editingUserIds.has(rosterUser.userId);

        const hasConfirmedWeekStatus =
          rosterUser.status === "confirmed-yes" ||
          rosterUser.status === "confirmed-no";

        if (!isEditing && hasConfirmedWeekStatus) {
          return rosterUser;
        }

        const currentlyAttending = isEditing
          ? resolveEditingAttendance({
              hasConfirmedVisit,
              planningOverrideState,
            })
          : resolveAttendance({
              hasConfirmedVisit,
              planningOverrideState,
              isDefaultScheduleDay,
            });

        return {
          ...rosterUser,
          status: currentlyAttending ? "planning-yes" : "planning-no",
        };
      },
    );

    const scheduledUserIds = new Set(
      rosterUsers.map((rosterUser) => rosterUser.userId),
    );

    const additionalSelectedUsers =
      overrides?.selected
        .filter(
          (planningUser: ChannelSerializedUser) =>
            !scheduledUserIds.has(planningUser.id),
        )
        .map((planningUser: ChannelSerializedUser): RosterUser => ({
          userId: planningUser.id,
          name: userDisplayName(planningUser),
          status: "planning-yes",
          isVisitor: false,
        })) ?? [];

    return [...additionalSelectedUsers, ...resolvedScheduledPeople];
  }

  function toggleMine(key: string): void {
    if (
      !myName ||
      !isPlanningConnected ||
      !capabilities.canChangeDates ||
      currentUserExternalVisitsByDate.has(key) ||
      !isDateEditableState(machineState)
    ) {
      return;
    }

    const currentlyAttending = machineSelectedDates.has(key);

    if (currentlyAttending) {
      machineDispatch({
        type: "DATE_DESELECTED",
        date: key
      });

      onPlanningToggle(key, false);
      return;
    }

    machineDispatch({
      type: "DATE_SELECTED",
      date: key
    });

    onPlanningToggle(key, true);
  }

  const attendance = Object.fromEntries(
    days.map((day) => {
      const key = generateDateKey(day);

      return [key, getDayData(key)];
    }),
  ) as WeekSchedule;

  // Confirmed counts drive the "Most confirmed" hot spot; visitor counts drive
  // the visitor badge. They're computed separately so one badge's presence never
  // depends on the other's.
  const confirmedCounts = days.map((day) =>
    confirmedCountOf(attendance[generateDateKey(day)] ?? EMPTY_DAY),
  );

  const visitorCounts = days.map((day) =>
    visitorCountOf(attendance[generateDateKey(day)] ?? EMPTY_DAY),
  );

  const planningCounts = days.map(
    (day) =>
      (attendance[generateDateKey(day)] ?? EMPTY_DAY).filter(
        (person) => person.status === "planning-yes",
      ).length,
  );

  const maxCount = Math.max(0, ...confirmedCounts);

  const hotSpotDays = new Set<number>();

  if (maxCount > 0) {
    const topConfirmed = confirmedCounts
      .map((_, index) => index)
      .filter((index) => confirmedCounts[index] === maxCount);

    const maxPlanning = Math.max(
      ...topConfirmed.map((index) => planningCounts[index]),
    );

    topConfirmed
      .filter((index) => planningCounts[index] === maxPlanning)
      .forEach((index) => {
        hotSpotDays.add(index);
      });
  }

  const todayIndex = days.findIndex((day) => isSameDay(day, new Date()));

  // The visitor badge shows on any office's calendar. The "Most confirmed" hot
  // spot likewise shows on any office's calendar (and for remote users viewing
  // them) — it's suppressed only per-day when you're confirmed elsewhere, where
  // the darker header would make it look cluttered.
  const isRemote = office.name.toLowerCase() === "remote";

  console.log("Machine state: ", machineState);

  if (isRemote) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line px-6 text-center text-sm text-fg-subtle">
        Remote has no weekly office schedule.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {todayIndex !== -1 && (
        <span
          data-tour="today-pill"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg px-3 py-1 text-[0.625rem] font-semibold text-fg-inverse"
          style={{
            left: `${((todayIndex + 0.5) / WEEKDAYS_PER_WEEK) * 100}%`,
          }}
        >
          Today
        </span>
      )}

      <div
        className="grid min-h-0 flex-1 divide-x-2 divide-line overflow-hidden rounded-xl border-2 border-line"
        style={{
          gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
          gridTemplateRows: "1fr",
        }}
      >
        {days.map((day, index) => {
          const key = generateDateKey(day);

          const rosterUsers: RosterUser[] = attendance[key] ?? EMPTY_DAY;

          const visitorCount = visitorCounts[index];

          const externalVisit = currentUserExternalVisitsByDate.get(key);
          const isElsewhere = externalVisit !== undefined;

          return (
            <DayCell
              key={key}
              date={day}
              officeId={office.id}
              rosterUsers={rosterUsers}
              myUserId={user.id}
              isMine={
                !isElsewhere &&
                rosterUsers.some(
                  (person) =>
                    person.userId === user.id && isInOffice(person.status),
                )
              }
              visitorCount={visitorCount}
              isHotSpot={hotSpotDays.has(index) && !isElsewhere}
              locked={locked}
              onToggleMine={() => toggleMine(key)}
              isConfirmedElsewhere={isElsewhere}
              externalOfficeName={externalOfficeNamesByDate.get(key)}
              externalOfficeEmoji={externalOfficeEmojisByDate.get(key)}
              currentOfficeName={office.name}
            />
          );
        })}
      </div>
    </div>
  );
}
