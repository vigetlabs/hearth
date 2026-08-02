import type { Office } from "@/types/api/offices";
import {
  buildCalendarToolbarViewModel,
  type CalendarToolbarViewModel,
} from "@/util/calendar/viewModel/toolbarBuilder";
import { addDays } from "@/util/dates/date";

export interface UseCalendarToolbarResult {
  viewModel: CalendarToolbarViewModel;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  confirmWeek: () => void;
  editWeek: () => void;
}

interface UseCalendarToolbarOptions {
  activeOffice: Office;
  focusedWeekStart: Date;
  changeWeek: (nextWeek: Date) => void;
}

export function useCalendarToolbar({
  activeOffice,
  focusedWeekStart,
  changeWeek,
}: UseCalendarToolbarOptions): UseCalendarToolbarResult {
  /*
   * Temporary sources.
   */
  const isWeekConfirmed = false;
  const isEditingWeek = false;
  const isConfirmationPending = false;
  const isPlanningConnected = true;
  const isAttendanceConnected = true;

  const viewModel = buildCalendarToolbarViewModel({
    activeOffice: activeOffice,
    focusedWeekStart: focusedWeekStart,

    isWeekConfirmed,
    isEditingWeek,
    isConfirmationPending,

    isPlanningConnected,
    isAttendanceConnected,
  });

  function goToPreviousWeek() {
    changeWeek(addDays(focusedWeekStart, -7));
  }

  function goToNextWeek() {
    changeWeek(addDays(focusedWeekStart, 7));
  }

  function goToToday() {
    changeWeek(new Date());
  }

  function confirmWeek() {
    // Connect confirmation mutation later.
  }

  function editWeek() {
    // Connect editing behavior later.
  }

  return {
    viewModel,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    confirmWeek,
    editWeek,
  };
}
