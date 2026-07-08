import { useState } from "react";

import { DayCell } from "@/components/Calendar/DayCell";
import type { EventsByDate } from "@/types/calendar";
import { addDays, startOfWeek, toDateKey } from "@/util/date";

// The view is simply how many weeks are stacked, starting from a Monday — never
// snapped to calendar-month boundaries.
const VIEW_WEEKS = [1, 4] as const;
type View = (typeof VIEW_WEEKS)[number];

const WEEKDAYS_PER_WEEK = 5; // Mon–Fri

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

interface CalendarProps {
  events: EventsByDate;
}

export function Calendar({ events }: CalendarProps) {
  const [view, setView] = useState<View>(1);
  // `focus` is always the Monday of the first visible week, so switching views
  // never lands on a partial week.
  const [focus, setFocus] = useState(() => startOfWeek(new Date()));

  const visibleWeeks = view;
  const days: Date[] = [];
  for (let week = 0; week < visibleWeeks; week++) {
    for (let day = 0; day < WEEKDAYS_PER_WEEK; day++) {
      days.push(addDays(focus, week * 7 + day));
    }
  }

  const step = 7 * visibleWeeks;
  const goPrev = () => setFocus((f) => addDays(f, -step));
  const goNext = () => setFocus((f) => addDays(f, step));
  const goToday = () => setFocus(startOfWeek(new Date()));

  // Weekday names for the column headers, taken from the first visible week so
  // they always line up with the grid columns below.
  const weekdayLabels = days
    .slice(0, WEEKDAYS_PER_WEEK)
    .map((day) => weekdayFormat.format(day));

  const gridColumns = {
    gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
  };

  const rangeTitle = `${rangeFormat.format(days[0])} – ${rangeFormat.format(
    days[days.length - 1],
  )}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <ViewToggle view={view} onChange={setView} />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {rangeTitle}
          </span>
          <div className="flex gap-1">
            <button
              onClick={goPrev}
              className={navButton}
              aria-label="Previous"
            >
              ‹
            </button>
            <button onClick={goToday} className={navButton}>
              Today
            </button>
            <button onClick={goNext} className={navButton} aria-label="Next">
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-2" style={gridColumns}>
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium uppercase text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid gap-2" style={gridColumns}>
        {days.map((day) => {
          const key = toDateKey(day);
          return <DayCell key={key} date={day} names={events[key] ?? []} />;
        })}
      </div>
    </div>
  );
}

const navButton =
  "rounded-md border border-gray-200 px-2.5 py-1 text-sm text-gray-700 hover:bg-gray-100";

interface ViewToggleProps {
  view: View;
  onChange: (view: View) => void;
}

function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-gray-200 p-0.5">
      {VIEW_WEEKS.map((weeks) => (
        <button
          key={weeks}
          onClick={() => onChange(weeks)}
          className={`rounded px-3 py-1 text-sm ${
            view === weeks
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {weeks} {weeks === 1 ? "week" : "weeks"}
        </button>
      ))}
    </div>
  );
}
