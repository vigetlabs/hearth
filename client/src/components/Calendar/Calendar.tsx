import { useState } from "react";

import { DayCell } from "@/components/Calendar/DayCell";

import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";

import { isInOffice } from "@/types/calendar/calendar";
import { userDisplayName } from "@/util/auth/displayName";
import { isSameDay, toDateKey } from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5;
const EMPTY_DAY: PersonStatus[] = [];

const confirmedCountOf = (day: PersonStatus[]): number =>
  day.filter((person) => person.status === "confirmed-yes").length;

type AttendanceOverrides = Record<string, AttendanceStatus>;

interface CalendarProps {
  schedule: WeekSchedule;
  office: Office;
  days: Date[];
  locked: boolean;
  user: User;
}

export function Calendar({
  schedule,
  office,
  days,
  locked,
  user,
}: CalendarProps) {
  const myName = userDisplayName(user);

  const [overrides, setOverrides] = useState<AttendanceOverrides>({});

  function getDayData(key: string): PersonStatus[] {
    const day = schedule[key] ?? EMPTY_DAY;
    const overriddenStatus = overrides[key];

    if (!overriddenStatus) {
      return day;
    }

    const mine = day.find((person) => person.userId === user.id);

    if (mine) {
      return day.map((person) =>
        person.userId === user.id
          ? {
              ...person,
              status: overriddenStatus,
            }
          : person,
      );
    }

    return [
      {
        userId: user.id,
        name: myName,
        status: overriddenStatus,
      },
      ...day,
    ];
  }

  function toggleMine(key: string): void {
    if (!myName || locked) return;

    const day = getDayData(key);
    const mine = day.find((person) => person.userId === user.id);

    const isCurrentlyGoing = mine !== undefined && isInOffice(mine.status);

    const nextStatus: AttendanceStatus = isCurrentlyGoing
      ? "planning-no"
      : "planning-yes";

    setOverrides((current) => ({
      ...current,
      [key]: nextStatus,
    }));

    // updateVisitMutation.mutate(...)
  }

  const attendance = Object.fromEntries(
    days.map((day) => {
      const key = toDateKey(day);

      return [key, getDayData(key)];
    }),
  ) as WeekSchedule;

  const counts = days.map((day) =>
    confirmedCountOf(attendance[toDateKey(day)] ?? EMPTY_DAY),
  );

  const planningCounts = days.map(
    (day) =>
      (attendance[toDateKey(day)] ?? EMPTY_DAY).filter(
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
      .forEach((index) => hotSpotDays.add(index));
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
        className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-line divide-x divide-line"
        style={{
          gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
          gridTemplateRows: "1fr",
        }}
      >
        {days.map((day, index) => {
          const key = toDateKey(day);
          const dayData = attendance[key] ?? EMPTY_DAY;
          const visitorCount = counts[index];

          return (
            <DayCell
              key={key}
              date={day}
              people={dayData}
              myUserId={user.id}
              isMine={dayData.some(
                (person) =>
                  person.userId === user.id && isInOffice(person.status),
              )}
              visitorCount={visitorCount}
              total={dayData.length}
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
