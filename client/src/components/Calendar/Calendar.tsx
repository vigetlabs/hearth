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
import { isInOffice } from "@/types/calendar/calendar";
import type { Office } from "@/types/api/offices";
import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { addDays, isSameDay, startOfWeek, toDateKey } from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5;

const EMPTY_DAY: PersonStatus[] = [];

const confirmedCountOf = (day: PersonStatus[]) =>
  day.filter((person) => person.status === "confirmed-yes").length;

// "Jun 29" / "Jul 3" — combined with the year into a "Jun 29 - Jul 3, 2026"
// range label for the week navigator.
const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

interface CalendarProps {
  schedule: WeekSchedule;
  office: Office;
  setOffice: (office: Office) => void;
}

export function Calendar({ schedule, office, setOffice }: CalendarProps) {
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

  function goPrevWeek(): void {
    setFocus((curDate) => addDays(curDate, -7));
  }
  function goNextWeek(): void {
    setFocus((curDate) => addDays(curDate, 7));
  }
  function goToday(): void {
    setFocus(startOfWeek(new Date()));
  }

  // Rewrite your own statuses for the focused week when it moves between planning
  // and confirmed, preserving the in/out axis: while planning, days read as
  // "planning-yes" (Planning) or "planning-no" (Not going); once locked in they
  // become "confirmed-yes" (In the office) or "confirmed-no" (Confirmed out).
  function setMineConfirmed(confirmed: boolean) {
    if (!myName) return;
    setAttendance((prev) => {
      const next = { ...prev };
      for (const date of days) {
        const key = toDateKey(date);
        const day = prev[key];
        if (!day) continue;
        const mine = day.find((person) => person.name === myName);
        if (!mine) continue;
        const inOffice = isInOffice(mine.status);
        const nextStatus: AttendanceStatus = confirmed
          ? inOffice
            ? "confirmed-yes"
            : "confirmed-no"
          : inOffice
            ? "planning-yes"
            : "planning-no";
        if (nextStatus === mine.status) continue;
        next[key] = day.map((person) =>
          person.name === myName ? { ...person, status: nextStatus } : person,
        );
      }
      return next;
    });
  }

  const confirmWeek = () => {
    setConfirmedWeeks((prev) => new Set(prev).add(weekKey));
    setMineConfirmed(true);
  };

  const unlockWeek = () => {
    setConfirmedWeeks((prev) => {
      const next = new Set(prev);
      next.delete(weekKey);
      return next;
    });
    setMineConfirmed(false);
  };

  function toggleMine() {}

  // While planning, picking a day marks you as "planning-yes" so you show up
  // under Planning; unpicking drops you to "planning-no" (Not going). Confirming
  // the week later promotes your picks to "confirmed-yes" (see confirmWeek).
  // function toggleMine(key: string) {
  //   if (!myName) return;
  //   setAttendance((prev) => {
  //     const day = prev[key] ?? EMPTY_DAY;
  //     const mine = day.find((person) => person.name === myName);
  //     const selected = mine ? mine.status !== "planning-no" : false;
  //     const nextStatus: AttendanceStatus = selected
  //       ? "planning-no"
  //       : "planning-yes";
  //     const nextDay: PersonStatus[] = mine
  //       ? day.map((person) =>
  //           person.name === myName ? { ...person, status: nextStatus } : person,
  //         )
  //       : [{ name: myName, status: nextStatus }, ...day];
  //     return { ...prev, [key]: nextDay };
  //   });
  // }

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
  // most still-planning ("planning-yes") people; if days remain tied, all show.
  const planningCounts = days.map(
    (day) =>
      (attendance[toDateKey(day)] ?? EMPTY_DAY).filter(
        (person) => person.status === "planning-yes",
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

  const isRemote = office.name.toLowerCase() === "remote";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-3 pb-5">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-fg">
          {office.name}
          <span aria-hidden="true">{office.emoji}</span>
        </h2>

        <OfficeSwitcher office={office} setOffice={setOffice} />
      </div>

      {!isRemote && (
        <div className="flex items-center gap-4 pb-5">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            <button
              onClick={goPrevWeek}
              className={arrowButton}
              aria-label="Previous week"
            >
              <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" />
            </button>
            <span className="px-2 text-sm font-bold text-fg">{rangeLabel}</span>
            <button
              onClick={goNextWeek}
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

          <div className="h-6 w-px bg-line-strong" />

          <p className="text-sm text-fg-subtle">
            {isWeekConfirmed ? (
              <span className="font-bold text-fg">Confirmed.</span>
            ) : (
              <>
                <span className="font-bold text-fg">Planning.</span> Yet to be
                confirmed
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
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line px-6 text-center text-sm text-fg-subtle">
          Remote has no weekly office schedule.
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col">
          {todayIndex !== -1 && (
            <span
              className={`pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isWeekConfirmed
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
                      person.name === myName && isInOffice(person.status),
                  )}
                  confirmedCount={count}
                  total={dayData.length}
                  fill={dayData.length > 0 ? count / dayData.length : 0}
                  isHotSpot={hotSpotDays.has(i)}
                  locked={isWeekConfirmed}
                  onToggleMine={toggleMine}
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
  "flex h-8 w-8 items-center justify-center rounded-full bg-surface text-fg-strong shadow-sm hover:bg-surface-sunken";

const pillButton =
  "rounded-full border border-strong bg-surface px-5 py-2 text-sm text-fg hover:bg-surface-sunken";

const todayButton = `${pillButton} font-semibold`;

const confirmButton = `ml-auto ${pillButton} font-bold`;

// Once confirmed, the schedule is locked; this reverts the week to planning.
const unlockButton =
  "ml-auto flex items-center gap-2 rounded-full bg-strong px-5 py-2 text-sm font-bold text-fg-inverse hover:bg-strong-hover";
