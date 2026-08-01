import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import { useCalendarScope } from "@/hooks/useCalendarScope";

const arrowButton =
  "flex h-7 w-7 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-subtle";

const todayButton =
  "rounded-full border border-line px-4 py-2 text-sm font-bold text-fg transition-colors hover:bg-surface-subtle";

const darkPillButton =
  "flex h-11 items-center gap-2 rounded-full bg-strong px-5 text-sm font-bold text-fg-inverse transition-colors hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60";

const confirmButton = `ml-auto ${darkPillButton} bg-fill hover:bg-fill-hover`;

const unlockButton = `ml-auto ${darkPillButton} bg-[#6f281d]! hover:bg-fg!`;

const WEEKDAYS_PER_WEEK = 5;

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export default function CalendarToolbar() {
  const scope = useCalendarScope();

  const isCurrentWeek = true;
  const isCalendarLocked = false;
  const isWeekConfirmed = false;
  const isEditingWeek = false;

  function goToPreviousWeek() {
    // Week navigation logic will be connected later.
  }

  function goToNextWeek() {
    // Week navigation logic will be connected later.
  }

  function goToToday() {
    // Today-navigation logic will be connected later.
  }

  function handleEditWeek() {
    // Editing logic will be connected later.
  }

  function handleConfirmWeek() {
    // Confirmation logic will be connected later.
  }

  return (
    <CalendarToolbarView
      focusedWeekStartKey={scope.focusedWeekStartKey}
      officeName={scope.activeOffice.name}
      isCurrentWeek={isCurrentWeek}
      isCalendarLocked={isCalendarLocked}
      isWeekConfirmed={isWeekConfirmed}
      isEditingWeek={isEditingWeek}
      onPreviousWeek={goToPreviousWeek}
      onNextWeek={goToNextWeek}
      onToday={goToToday}
      onEditWeek={handleEditWeek}
      onConfirmWeek={handleConfirmWeek}
    />

  );
}

interface CalendarToolbarViewProps {
  focusedWeekStartKey: string;
  officeName: string;
  isCurrentWeek: boolean;
  isCalendarLocked: boolean;
  isWeekConfirmed: boolean;
  isEditingWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onEditWeek: () => void;
  onConfirmWeek: () => void;
}

function CalendarToolbarView({
  focusedWeekStartKey,
  officeName,
  isCurrentWeek,
  isCalendarLocked,
  isWeekConfirmed,
  isEditingWeek,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onEditWeek,
  onConfirmWeek,
}: CalendarToolbarViewProps) {
  const rangeLabel = formatWeekRange(focusedWeekStartKey);

  return (
    <div className="flex items-center gap-4 pb-5">
      <div className="flex items-center gap-1 rounded-full border-2 border-line bg-surface p-1">
        <button
          type="button"
          onClick={onPreviousWeek}
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
          onClick={onNextWeek}
          className={arrowButton}
          aria-label="Next week"
        >
          <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90" />
        </button>
      </div>

      {!isCurrentWeek && (
        <button type="button" onClick={onToday} className={todayButton}>
          Jump to today
        </button>
      )}

      <div className="h-4 w-0.5 bg-line" />

      <p className="text-sm text-fg">
        <span className="font-bold text-fg">
          {isCalendarLocked
            ? "Confirmed ✓"
            : `Planning for ${capitalizeOfficeName(officeName)}.`}
        </span>{" "}
        {isCalendarLocked
          ? "Edit Week to make changes."
          : "Select your days, then confirm."}
      </p>

      {isWeekConfirmed && !isEditingWeek ? (
        <button
          type="button"
          data-tour="confirm-week"
          onClick={onEditWeek}
          className={unlockButton}
        >
          Edit Week
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          data-tour="confirm-week"
          onClick={onConfirmWeek}
          className={confirmButton}
        >
          Confirm Week
        </button>
      )}
    </div>
  );
}


function formatWeekRange(weekStartKey: string): string {
  const weekDates = generateWeekDates(weekStartKey);
  const weekEnd = weekDates[WEEKDAYS_PER_WEEK - 1];

  return `${rangeFormat.format(weekDates[0])} - ${rangeFormat.format(
    weekEnd,
  )}, ${weekEnd.getFullYear()}`;
}


function capitalizeOfficeName(name: string): string {
  if (name.length === 0) {
    return name;
  }

  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function generateWeekDates(weekStartKey: string): Date[] {
  const weekStart = parseDateKey(weekStartKey);

  return Array.from({ length: WEEKDAYS_PER_WEEK }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return date;
  });
}

