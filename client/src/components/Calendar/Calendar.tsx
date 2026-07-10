import { useState } from "react";

import { DayCell } from "@/components/Calendar/DayCell";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";
import type { EventsByDate } from "@/types/calendar/calendar";
import { useOffice } from "@/util/office/useOffice";
import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5; // Mon–Fri

// A week can straddle two months, so we title it by the month containing its
// Thursday — the same convention ISO weeks use.
const THURSDAY_INDEX = 3;
const monthYearFormat = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

interface CalendarProps {
  events: EventsByDate;
}

export function Calendar({ events }: CalendarProps) {
  const { office } = useOffice();
  const { user } = useAuth();
  const myName = userDisplayName(user);

  // `focus` is always the Monday of the visible week, so navigation never lands
  // on a partial week.
  const [focus, setFocus] = useState(() => startOfWeek(new Date()));
  // Local attendance so toggling yourself in/out of a day updates the grid.
  const [attendance, setAttendance] = useState<EventsByDate>(events);

  const days: Date[] = [];
  for (let day = 0; day < WEEKDAYS_PER_WEEK; day++) {
    days.push(addDays(focus, day));
  }

  const goPrev = () => setFocus((f) => addDays(f, -7));
  const goNext = () => setFocus((f) => addDays(f, 7));
  const goToday = () => setFocus(startOfWeek(new Date()));

  function toggleMine(key: string) {
    if (!myName) return;
    setAttendance((prev) => {
      const list = prev[key] ?? [];
      const nextList = list.includes(myName)
        ? list.filter((name) => name !== myName)
        : [...list, myName];
      return { ...prev, [key]: nextList };
    });
  }

  const gridColumns = {
    gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
    // A single `1fr` row lets the day columns stretch to fill the card, which is
    // now sized to 90% of the space below the header.
    gridTemplateRows: "1fr",
  };

  const monthTitle = monthYearFormat.format(days[THURSDAY_INDEX]);

  // Remote has no in-office schedule, so the weekly grid doesn't apply — hide it
  // and the week navigation, leaving only the office title and switcher.
  const isRemote = office.id === "remote";

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            {office.name}
            <span aria-hidden="true">{office.emoji}</span>
          </h2>

          <OfficeSwitcher />
        </div>

        {!isRemote && (
          <div className="flex items-center gap-4">
            <button onClick={goToday} className={navButton}>
              jump to today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className={arrowButton}
                aria-label="Previous week"
              >
                ‹
              </button>
              <span className="min-w-[8.5rem] text-center text-base font-bold text-gray-900">
                {monthTitle}
              </span>
              <button
                onClick={goNext}
                className={arrowButton}
                aria-label="Next week"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {isRemote ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 px-6 text-center text-sm text-gray-500">
          Remote has no weekly office schedule.
        </div>
      ) : (
        <div
          className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 divide-x divide-gray-200"
          style={gridColumns}
        >
          {days.map((day) => {
            const key = toDateKey(day);
            const names = attendance[key] ?? [];
            return (
              <DayCell
                key={key}
                date={day}
                names={names}
                myName={myName}
                isMine={names.includes(myName)}
                onToggleMine={() => toggleMine(key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

const navButton =
  "rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100";

const arrowButton =
  "flex h-7 w-7 items-center justify-center rounded-md text-lg text-gray-600 hover:bg-gray-100";
