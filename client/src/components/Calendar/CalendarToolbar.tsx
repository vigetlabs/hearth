import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import type { CalendarToolbarViewModel } from "@/util/calendar/viewModel/toolbarBuilder";
import { useCalendarToolbar } from "@/hooks/data/useCalendarToolbar";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";

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

  const {
    viewModel,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    confirmWeek,
    editWeek,
  } = useCalendarToolbar({
    activeOffice: scope.activeOffice,
    focusedWeekStart: scope.focusedWeekStart,
    changeWeek: scope.changeWeek,
  });

  return (
    <CalendarToolbarView
      viewModel={viewModel}
      onPreviousWeek={goToPreviousWeek}
      onNextWeek={goToNextWeek}
      onToday={goToToday}
      onEditWeek={editWeek}
      onConfirmWeek={confirmWeek}
    />

  );
}

interface CalendarToolbarViewProps {
  viewModel: CalendarToolbarViewModel;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onEditWeek: () => void;
  onConfirmWeek: () => void;
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
        <span className="px-2 text-sm font-normal text-fg">
          {viewModel.rangeLabel}
        </span>
        -        <span className="px-2 text-sm font-normal text-fg">{rangeLabel}</span>
        +        <span className="px-2 text-sm font-normal text-fg">
          +          {rangeLabel}
          +        </span>
        <button
          type="button"
          onClick={onNextWeek}
          className={arrowButton}
          aria-label="Next week"
        >
          <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90" />
        </button>
      </div>

      {viewModel.showJumpToToday && (
        <button type="button" onClick={onToday} className={todayButton}>
          Jump to today
        </button>
      )}

      <div className="h-4 w-0.5 bg-line" />

      <p className="text-sm text-fg">
        <span className="font-bold text-fg">{viewModel.status.heading}</span>{" "}
        {viewModel.status.description}
        <span className="font-bold text-fg">
          {isCalendarLocked
            ? "Confirmed ✓"
            : `Planning for ${capitalizeOfficeName(scope.activeOffice.name)}.`}
          : `Planning for ${capitalizeOfficeName(officeName)}.`}
        </span>{" "}
        {isCalendarLocked
          ? "Edit Week to make changes."
          : "Select your days, then confirm."}
      </p>

      {viewModel.primaryAction.variation === "edit" ? (
        <button
          type="button"
          data-tour="confirm-week"
          disabled={viewModel.primaryAction.disabled}
          onClick={onEditWeek}
          className={unlockButton}
        >
          {viewModel.primaryAction.label}
          < PencilIcon className="h-3.5 w-3.5" />
        </button >
      ) : (
        <button
          type="button"
          data-tour="confirm-week"
          disabled={viewModel.primaryAction.disabled}
          onClick={onConfirmWeek}
          className={confirmButton}
        >
          {viewModel.primaryAction.label}
        </button >
      )
      }
    </div >
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
