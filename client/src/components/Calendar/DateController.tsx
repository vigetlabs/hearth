import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { addDays } from "@/util/dates/date";

interface DateControllerProps {
  startingWeekStartFocus: string;
  weekStartFocus: Date;
  weekStartFocusDateKey: string;
  onChangeFocusedWeek: (nexWeekStart: Date) => void;
  weekDates: Date[];
}

export default function DateController({
  startingWeekStartFocus,
  weekStartFocus,
  weekStartFocusDateKey,
  onChangeFocusedWeek,
  weekDates
}: DateControllerProps) {
  function goPrevWeek(): void {
    onChangeFocusedWeek(addDays(weekStartFocus, -7))
  }
  function goNextWeek(): void {
    onChangeFocusedWeek(addDays(weekStartFocus, 7))
  }
  function goToday(): void {
    onChangeFocusedWeek(new Date())
  }

  const isCurrentWeek = weekStartFocusDateKey === startingWeekStartFocus;

  const rangeLabel = `${rangeFormat.format(
    weekDates[0],
  )} - ${rangeFormat.format(
    weekDates[WEEKDAYS_PER_WEEK - 1],
  )}, ${weekDates[WEEKDAYS_PER_WEEK - 1].getFullYear()}`;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border-2 border-line bg-surface p-1">
        <button
          type="button"
          onClick={goPrevWeek}
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
    </div>
  );
}

const WEEKDAYS_PER_WEEK = 5;

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const arrowButton =
  "flex h-8 w-8 items-center justify-center text-fg-subtle transition-colors hover:text-fg";

const pillButton =
  "inline-flex h-11 items-center rounded-full border-2 border-line bg-surface px-5 text-sm text-fg transition-colors hover:bg-surface-sunken";

const todayButton = `${pillButton} font-bold`;
