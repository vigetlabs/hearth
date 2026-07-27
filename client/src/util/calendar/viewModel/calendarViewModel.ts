import type { CalendarScope } from "@/contexts/CalendarScopeContext";

import {
  buildCalendarToolbarViewModel,
  type CalendarToolbarViewModel,
} from "./toolbarBuilder";

export interface CalendarViewModel {
  toolbar: CalendarToolbarViewModel;
  // grid: CalendarGridViewModel;
}

interface BuildCalendarViewModelInput {
  scope: CalendarScope;

  isWeekConfirmed: boolean;
  isEditingWeek: boolean;
  isConfirmationPending: boolean;

  isPlanningConnected: boolean;
  isAttendanceConnected: boolean;
}

export function buildCalendarViewModel({
  scope,
  isWeekConfirmed,
  isEditingWeek,
  isConfirmationPending,
  isPlanningConnected,
  isAttendanceConnected,
}: BuildCalendarViewModelInput): CalendarViewModel {
  return {
    toolbar: buildCalendarToolbarViewModel({
      activeOffice: scope.activeOffice,
      focusedWeekStart: scope.focusedWeekStart,

      isWeekConfirmed,
      isEditingWeek,
      isConfirmationPending,

      isPlanningConnected,
      isAttendanceConnected,
    }),
  };
}
