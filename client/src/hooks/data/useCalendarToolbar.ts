import type { Office } from "@/types/api/offices";
import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";
import {
  machineStates,
  type CalendarMachineState,
} from "@/types/calendar/machine/machineState";
import { calendarEvents } from "@/util/calendar/machine/calendarEvents";
import {
  buildCalendarToolbarViewModel,
  type CalendarToolbarViewModel,
} from "@/util/calendar/viewModel/toolbarBuilder";
import { addDays } from "@/util/dates/date";
import type { Dispatch } from "react";

export interface UseCalendarToolbarResult {
  viewModel: CalendarToolbarViewModel;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  confirmWeek: () => void;
  editWeek: () => void;
}

interface UseCalendarToolbarInput {
  activeOffice: Office;
  focusedWeekStart: Date;
  changeWeek: (nextWeek: Date) => void;
  machineState: CalendarMachineState;
  dispatch: Dispatch<CalendarMachineEvent>;
}

export function useCalendarToolbar({
  activeOffice,
  focusedWeekStart,
  changeWeek,
  machineState,
  dispatch,
}: UseCalendarToolbarInput): UseCalendarToolbarResult {
  const isWeekConfirmed = machineState.status === machineStates.CONFIRMED;
  const isEditingWeek = machineState.status === machineStates.PLANNING;
  const isConfirmationPending =
    machineState.status === machineStates.CONFIRMING;

  /*
   * Temporary sources.
   */
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
    dispatch(calendarEvents.confirmWeekRequested());
  }

  function editWeek() {
    dispatch(calendarEvents.editWeekRequested());
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
