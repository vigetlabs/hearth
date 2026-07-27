import ChevronDownIcon from "@/components/icons/ChevronDownIcon";

import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { addDays, startOfWeek } from "@/util/dates/date";
import { generateDateKey } from "@/util/dates/date";

const arrowButton =
  "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-subtle";

const todayButton =
  "rounded-full px-3 py-2 text-sm font-bold text-fg-subtle transition-colors hover:bg-surface-subtle hover:text-fg";

const rangeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export default function DateController() {
  const {
    focusedWeekStart,
    focusedWeekStartKey,
    changeWeek,
  } = useCalendarScope();

  const focusedWeekEnd = addDays(
    focusedWeekStart,
    4,
  );

  const rangeLabel = `${rangeFormatter.format(
    focusedWeekStart,
  )} – ${rangeFormatter.format(
    focusedWeekEnd,
  )}, ${focusedWeekEnd.getFullYear()}`;

  const currentWeekStartKey = generateDateKey(
    startOfWeek(new Date()),
  );

  const isCurrentWeek =
    focusedWeekStartKey === currentWeekStartKey;

  function goPreviousWeek(): void {
    changeWeek(addDays(focusedWeekStart, -7));
  }

  function goNextWeek(): void {
    changeWeek(addDays(focusedWeekStart, 7));
  }

  function goToday(): void {
    changeWeek(new Date());
  }

  return (
    <>
      <div className="flex items-center gap-1 rounded-full border-2 border-line bg-surface p-1">
        <button
          type="button"
          onClick={goPreviousWeek}
          className={arrowButton}
          aria-label="Previous week"
        >
          <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" />
        </button>

        <span className="px-2 text-sm font-normal text-fg">
          {rangeLabel}
        </span>

        <button
          type="button"
          onClick={goNextWeek}
          className={arrowButton}
          aria-label="Next week"
        >
          <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90" />
        </button>
      </div>

      {!isCurrentWeek && (
        <button
          type="button"
          onClick={goToday}
          className={todayButton}
        >
          Jump to today
        </button>
      )}
    </>
  );
}
