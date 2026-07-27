import {
  buildCalendarToolbarViewModel,
  type CalendarToolbarViewModel,
} from "@/util/calendar/viewModel/toolbarBuilder";
import { addDays } from "@/util/dates/date";

import { useCalendarScope } from "../contexts/useCalendarScopeContext";

export interface UseCalendarToolbarResult {
  viewModel: CalendarToolbarViewModel;

  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;

  confirmWeek: () => void;
  editWeek: () => void;
}

export function useCalendarToolbar(): UseCalendarToolbarResult {
  const scope = useCalendarScope();

  /*
   * Temporary sources.
   */
  const isWeekConfirmed = false;
  const isEditingWeek = false;
  const isConfirmationPending = false;
  const isPlanningConnected = true;
  const isAttendanceConnected = true;

  const viewModel = buildCalendarToolbarViewModel({
    activeOffice: scope.activeOffice,
    focusedWeekStart: scope.focusedWeekStart,

    isWeekConfirmed,
    isEditingWeek,
    isConfirmationPending,

    isPlanningConnected,
    isAttendanceConnected,
  });

  function goToPreviousWeek() {
    scope.changeWeek(addDays(scope.focusedWeekStart, -7));
  }

  function goToNextWeek() {
    scope.changeWeek(addDays(scope.focusedWeekStart, 7));
  }

  function goToToday() {
    scope.changeWeek(new Date());
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
