import { useState } from "react";

import { DayCell } from "@/components/Calendar/DayCell";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import LockIcon from "@/components/icons/LockIcon";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { useOffice } from "@/util/office/useOffice";
import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { addDays, isSameDay, startOfWeek, toDateKey } from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5;

const EMPTY_DAY: PersonStatus[] = [];

const confirmedCountOf = (day: PersonStatus[]) =>
  day.filter((person) => person.status === "confirmed").length;

// "Jun 29" / "Jul 3" — combined with the year into a "Jun 29 - Jul 3, 2026"
// range label for the week navigator.
const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

interface CalendarProps {
  schedule: WeekSchedule;
}

export function Calendar({ schedule }: CalendarProps) {
  const { office } = useOffice();
  const { user } = useAuth();
  const myName = userDisplayName(user);

  const [focus, setFocus] = useState(() => startOfWeek(new Date()));
  // Local attendance so toggling yourself in/out of a day updates the grid.
  const [attendance, setAttendance] = useState<WeekSchedule>(schedule);
  // Weeks the user has confirmed, keyed by their Monday. A week starts in the
  // planning state and moves to confirmed via the "Confirm Week" button.
  const [confirmedWeeks, setConfirmedWeeks] = useState<Set<string>>(new Set());

  const days: Date[] = [];
  for (let day = 0; day < WEEKDAYS_PER_WEEK; day++) {
    days.push(addDays(focus, day));
  }

  const weekKey = toDateKey(focus);
  const isWeekConfirmed = confirmedWeeks.has(weekKey);
  // Whether the focused week is the one containing today, so we can hide the
  // "Jump to today" shortcut when it would be a no-op.
  const isCurrentWeek = weekKey === toDateKey(startOfWeek(new Date()));

  const goPrev = () => setFocus((f) => addDays(f, -7));
  const goNext = () => setFocus((f) => addDays(f, 7));
  const goToday = () => setFocus(startOfWeek(new Date()));

  // Rewrite your own selected days for the focused week when it moves between
  // planning and confirmed: a day you've picked reads as "maybe" (Planning)
  // while planning and "confirmed" (In the office) once the week is locked in.
  // Days you're out of ("no") are left alone.
  function setMineForWeek(selectedStatus: AttendanceStatus) {
    if (!myName) return;
    setAttendance((prev) => {
      const next = { ...prev };
      for (const date of days) {
        const key = toDateKey(date);
        const day = prev[key];
        if (!day) continue;
        const mine = day.find((person) => person.name === myName);
        if (!mine || mine.status === "no") continue;
        next[key] = day.map((person) =>
          person.name === myName
            ? { ...person, status: selectedStatus }
            : person,
        );
      }
      return next;
    });
  }

  const confirmWeek = () => {
    setConfirmedWeeks((prev) => new Set(prev).add(weekKey));
    setMineForWeek("confirmed");
  };

  const unlockWeek = () => {
    setConfirmedWeeks((prev) => {
      const next = new Set(prev);
      next.delete(weekKey);
      return next;
    });
    setMineForWeek("maybe");
  };

  // While planning, picking a day marks you as "maybe" so you show up under
  // Planning; unpicking drops you to "no" (Not going). Confirming the week
  // later promotes your picks to "confirmed" (see confirmWeek).
  function toggleMine(key: string) {
    if (!myName) return;
    setAttendance((prev) => {
      const day = prev[key] ?? EMPTY_DAY;
      const mine = day.find((person) => person.name === myName);
      const selected = mine ? mine.status !== "no" : false;
      const nextStatus: AttendanceStatus = selected ? "no" : "maybe";
      const nextDay: PersonStatus[] = mine
        ? day.map((person) =>
            person.name === myName ? { ...person, status: nextStatus } : person,
          )
        : [{ name: myName, status: nextStatus }, ...day];
      return { ...prev, [key]: nextDay };
    });
  }

  const gridColumns = {
    gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
    gridTemplateRows: "1fr",
  };

  const rangeLabel = `${rangeFormat.format(days[0])} - ${rangeFormat.format(
    days[WEEKDAYS_PER_WEEK - 1],
  )}, ${days[WEEKDAYS_PER_WEEK - 1].getFullYear()}`;

  const counts = days.map((day) =>
    confirmedCountOf(attendance[toDateKey(day)] ?? EMPTY_DAY),
  );
  const maxCount = Math.max(0, ...counts);

  // The hot spot is the day with the most confirmed people. Ties break by the
  // most still-planning ("maybe") people; if days remain tied, all of them show.
  const planningCounts = days.map(
    (day) =>
      (attendance[toDateKey(day)] ?? EMPTY_DAY).filter(
        (person) => person.status === "maybe",
      ).length,
  );
  const hotSpotDays = new Set<number>();
  if (maxCount > 0) {
    const topConfirmed = counts
      .map((_, i) => i)
      .filter((i) => counts[i] === maxCount);
    const maxPlanning = Math.max(...topConfirmed.map((i) => planningCounts[i]));
    topConfirmed
      .filter((i) => planningCounts[i] === maxPlanning)
      .forEach((i) => hotSpotDays.add(i));
  }

  const today = new Date();
  const todayIndex = days.findIndex((day) => isSameDay(day, today));

  const isRemote = office.id === "remote";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 pb-5">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          {office.name}
          <span aria-hidden="true">{office.emoji}</span>
        </h2>

        <OfficeSwitcher />
      </div>

      {!isRemote && (
        <div className="flex items-center gap-4 pb-5">
          <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
            <button
              onClick={goPrev}
              className={arrowButton}
              aria-label="Previous week"
            >
              <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" />
            </button>
            <span className="px-2 text-sm font-bold text-gray-900">
              {rangeLabel}
            </span>
            <button
              onClick={goNext}
              className={arrowButton}
              aria-label="Next week"
            >
              <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90" />
            </button>
          </div>

          {!isCurrentWeek && (
            <button onClick={goToday} className={todayButton}>
              Jump to today
            </button>
          )}

          <div className="h-6 w-px bg-gray-300" />

          <p className="text-sm text-gray-500">
            {isWeekConfirmed ? (
              <span className="font-bold text-gray-900">Confirmed.</span>
            ) : (
              <>
                <span className="font-bold text-gray-900">Planning.</span> Yet
                to be confirmed
              </>
            )}
          </p>

          {isWeekConfirmed ? (
            <button onClick={unlockWeek} className={unlockButton}>
              <LockIcon className="h-3.5 w-3.5" />
              Unlock schedule
            </button>
          ) : (
            <button onClick={confirmWeek} className={confirmButton}>
              Confirm Week
            </button>
          )}
        </div>
      )}

      {isRemote ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 px-6 text-center text-sm text-gray-500">
          Remote has no weekly office schedule.
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col">
          {todayIndex !== -1 && (
            <span
              className={`pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isWeekConfirmed
                  ? "border border-gray-900 bg-white text-gray-900"
                  : "bg-gray-900 text-white"
              }`}
              style={{
                left: `${((todayIndex + 0.5) / WEEKDAYS_PER_WEEK) * 100}%`,
              }}
            >
              Today
            </span>
          )}

          <div
            className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 divide-x divide-gray-200"
            style={gridColumns}
          >
            {days.map((day, i) => {
              const key = toDateKey(day);
              const dayData = attendance[key] ?? EMPTY_DAY;
              const count = counts[i];
              return (
                <DayCell
                  key={key}
                  date={day}
                  people={dayData}
                  myName={myName}
                  isMine={dayData.some(
                    (person) =>
                      person.name === myName && person.status !== "no",
                  )}
                  confirmedCount={count}
                  total={dayData.length}
                  fill={dayData.length > 0 ? count / dayData.length : 0}
                  isHotSpot={hotSpotDays.has(i)}
                  locked={isWeekConfirmed}
                  onToggleMine={() => toggleMine(key)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const arrowButton =
  "flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm hover:bg-gray-50";

const pillButton =
  "rounded-full border border-gray-900 bg-white px-5 py-2 text-sm text-gray-900 hover:bg-gray-50";

const todayButton = `${pillButton} font-semibold`;

const confirmButton = `ml-auto ${pillButton} font-bold`;

// Once confirmed, the schedule is locked; this reverts the week to planning.
const unlockButton =
  "ml-auto flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-bold text-white hover:bg-gray-800";
