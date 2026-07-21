import { DayCell } from "@/components/Calendar/DayCell";

import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
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

const WEEKDAYS_PER_WEEK = 5;
const EMPTY_DAY: RosterUser[] = [];

const confirmedCountOf = (day: RosterUser[]): number =>
  day.filter((person) => person.status === "confirmed-yes").length;

interface CalendarProps {
  schedule: WeekSchedule;
  office: Office;
  days: Date[];
  locked: boolean;
  user: User;
  planningByDate: OfficeDatesPlanningOverrideStates;
  isPlanningConnected: boolean;
  isAttendingConnected: boolean;
  onPlanningToggle: (date: string, attending: boolean) => void;
  editingConfirmedWeek: boolean;
}

export function Calendar({
  schedule,
  office,
  days,
  locked,
  user,
  planningByDate,
  isPlanningConnected,
  isAttendingConnected,
  onPlanningToggle,
  editingConfirmedWeek,
}: CalendarProps) {
  const myName = userDisplayName(user);

  function getDayData(key: string): RosterUser[] {
    const rosterUsers: RosterUser[] = schedule[key] ?? EMPTY_DAY;
    const overrides: TogglePlanningOverrideState = planningByDate[key];

    const resolvedScheduledPeople = rosterUsers.map(
      (rosterUser): RosterUser => {
        const planningOverrideState: PlanningOverrideState =
          planningOverrideStateForUser(overrides, rosterUser.userId);

        const isEditingWeek =
          editingConfirmedWeek && rosterUser.userId === user.id;

        const isPersistedStatus =
          rosterUser.status === "confirmed-yes" ||
          rosterUser.status === "confirmed-no" ||
          rosterUser.status === "confirmed-elsewhere";

        if (isPersistedStatus && !isEditingWeek) {
          return rosterUser;
        }

        if (isEditingWeek) {
          if (planningOverrideState === "selected") {
            return {
              ...rosterUser,
              status: "planning-yes",
            };
          }

          if (planningOverrideState === "deselected") {
            return {
              ...rosterUser,
              status: "planning-no",
            };
          }
          return rosterUser;
        }

        if (planningOverrideState === "selected") {
          return {
            ...rosterUser,
            status: "planning-yes",
          };
        }

        if (planningOverrideState === "deselected") {
          return {
            ...rosterUser,
            status: "planning-no",
          };
        }

        return rosterUser;
      },
    );

    const scheduledUserIds = new Set(
      rosterUsers.map((rosterUser: RosterUser) => rosterUser.userId),
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
        })) ?? [];

    return [...additionalSelectedUsers, ...resolvedScheduledPeople];
  }

  function toggleMine(key: string): void {
    if (!myName || locked || !isPlanningConnected || !isAttendingConnected) {
      return;
    }

    const baseDay = schedule[key] ?? EMPTY_DAY;

    const currentPerson = baseDay.find((person) => person.userId === user.id);

    if (currentPerson?.status === "confirmed-elsewhere") {
      return;
    }

    const { hasConfirmedVisit, isDefaultScheduleDay } = baseAttendanceForUser({
      day: baseDay,
      userId: user.id,
    });

    if (hasConfirmedVisit && !editingConfirmedWeek) {
      return;
    }

    const planningOverrideState = planningOverrideStateForUser(
      planningByDate[key],
      user.id,
    );

    const currentlyAttending = editingConfirmedWeek
      ? resolveEditingAttendance({
          hasConfirmedVisit,
          planningOverrideState,
        })
      : resolveAttendance({
          hasConfirmedVisit,
          planningOverrideState,
          isDefaultScheduleDay,
        });

    onPlanningToggle(key, !currentlyAttending);
  }

  const attendance = Object.fromEntries(
    days.map((day) => {
      const key = generateDateKey(day);

      return [key, getDayData(key)];
    }),
  ) as WeekSchedule;

  const counts = days.map((day) =>
    confirmedCountOf(attendance[generateDateKey(day)] ?? EMPTY_DAY),
  );

  const planningCounts = days.map(
    (day) =>
      (attendance[generateDateKey(day)] ?? EMPTY_DAY).filter(
        (person) => person.status === "planning-yes",
      ).length,
  );

  const maxCount = Math.max(0, ...counts);

  const hotSpotDays = new Set<number>();

  if (maxCount > 0) {
    const topConfirmed = counts
      .map((_, index) => index)
      .filter((index) => counts[index] === maxCount);

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

  const isRemote = office.name.toLowerCase() === "remote";

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
          className={`pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            locked
              ? "border border-strong bg-surface text-fg"
              : "bg-strong text-fg-inverse"
          }`}
          style={{
            left: `${((todayIndex + 0.5) / WEEKDAYS_PER_WEEK) * 100}%`,
          }}
        >
          Today
        </span>
      )}

      <div
        className="grid min-h-0 flex-1 divide-x divide-line overflow-hidden rounded-xl border border-line"
        style={{
          gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
          gridTemplateRows: "1fr",
        }}
      >
        {days.map((day, index) => {
          const key = generateDateKey(day);

          const rosterUsers: RosterUser[] = attendance[key] ?? EMPTY_DAY;

          const visitorCount = counts[index];

          return (
            <DayCell
              key={key}
              date={day}
              rosterUsers={rosterUsers}
              myUserId={user.id}
              isMine={rosterUsers.some(
                (person) =>
                  person.userId === user.id && isInOffice(person.status),
              )}
              visitorCount={visitorCount}
              total={rosterUsers.length}
              isHotSpot={hotSpotDays.has(index)}
              locked={locked}
              onToggleMine={() => toggleMine(key)}
            />
          );
        })}
      </div>
    </div>
  );
}
