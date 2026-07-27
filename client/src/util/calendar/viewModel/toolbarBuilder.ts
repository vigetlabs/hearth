import type { Office } from "@/types/api/offices";
import { startOfWeek } from "@/util/dates/date";

export interface CalendarToolbarViewModel {
  rangeLabel: string;
  showJumpToToday: boolean;
  status: CalendarStatusViewModel;
  primaryAction: CalendarPrimaryActionViewModel;
}

interface CalendarStatusViewModel {
  heading: string;
  description: string;
}

interface CalendarPrimaryActionViewModel {
  variation: "confirm" | "edit";
  label: string;
  disabled: boolean;
}

interface BuildCalendarToolbarViewModelInput {
  activeOffice: Office;
  focusedWeekStart: Date;

  isWeekConfirmed: boolean;
  isEditingWeek: boolean;
  isConfirmationPending: boolean;
  isPlanningConnected: boolean;
  isAttendanceConnected: boolean;
}

export function buildCalendarToolbarViewModel({
  activeOffice,
  focusedWeekStart,
  isWeekConfirmed,
  isEditingWeek,
  isConfirmationPending,
  isPlanningConnected,
  isAttendanceConnected,
}: BuildCalendarToolbarViewModelInput): CalendarToolbarViewModel {
  const isCalendarLocked = isWeekConfirmed && !isEditingWeek;

  return {
    rangeLabel: formatWeekRange(focusedWeekStart),

    showJumpToToday: !isFocusedWeekCurrent(focusedWeekStart),

    status: buildCalendarStatusViewModel({
      activeOffice,
      isCalendarLocked,
    }),

    primaryAction: buildPrimaryActionViewModel({
      isWeekConfirmed,
      isEditingWeek,
      isConfirmationPending,
      isPlanningConnected,
      isAttendanceConnected,
    }),
  };
}

interface BuildCalendarStatusViewModelInput {
  activeOffice: Office;
  isCalendarLocked: boolean;
}

function buildCalendarStatusViewModel({
  activeOffice,
  isCalendarLocked,
}: BuildCalendarStatusViewModelInput): CalendarStatusViewModel {
  if (isCalendarLocked) {
    return {
      heading: "Confirmed ✓",
      description: "Edit week to make changes.",
    };
  }

  return {
    heading: `Planning for ${capitalizeOfficeName(activeOffice.name)}.`,
    description: "Select your days, then confirm.",
  };
}

function capitalizeOfficeName(name: string): string {
  if (name.length === 0) {
    return name;
  }

  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

interface BuildPrimaryActionViewModelInput {
  isWeekConfirmed: boolean;
  isEditingWeek: boolean;
  isConfirmationPending: boolean;
  isPlanningConnected: boolean;
  isAttendanceConnected: boolean;
}

function buildPrimaryActionViewModel({
  isWeekConfirmed,
  isEditingWeek,
  isConfirmationPending,
  isPlanningConnected,
  isAttendanceConnected,
}: BuildPrimaryActionViewModelInput): CalendarPrimaryActionViewModel {
  const shouldShowEditAction = isWeekConfirmed && !isEditingWeek;

  if (shouldShowEditAction) {
    return {
      variation: "edit",
      label: "Edit Week",
      disabled: !isAttendanceConnected || !isPlanningConnected,
    };
  }

  return {
    variation: "confirm",
    label: isConfirmationPending ? "Confirming..." : "Confirm Week",
    disabled: isConfirmationPending || !isPlanningConnected,
  };
}

const WEEKDAYS_PER_WEEK = 5;

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function generateWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: WEEKDAYS_PER_WEEK }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return date;
  });
}

function formatWeekRange(weekStart: Date): string {
  const weekDates = generateWeekDates(weekStart);

  const firstDate = weekDates[0];
  const lastDate = weekDates[WEEKDAYS_PER_WEEK - 1];

  return `${rangeFormat.format(firstDate)} - ${rangeFormat.format(
    lastDate,
  )}, ${lastDate.getFullYear()}`;
}

function isFocusedWeekCurrent(focusedWeekStart: Date): boolean {
  const currentWeekStart = startOfWeek(new Date());

  return (
    focusedWeekStart.getFullYear() === currentWeekStart.getFullYear() &&
    focusedWeekStart.getMonth() === currentWeekStart.getMonth() &&
    focusedWeekStart.getDate() === currentWeekStart.getDate()
  );
}
