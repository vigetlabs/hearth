import { useEffect, useReducer } from "react";

import { calendarMachineReducer } from "./machineTransitioner";
import { machineStates, type CalendarMachineState, type CalendarScope, type InitialState } from "@/types/calendar/machineState";
import type { CalendarMachineEvent } from "@/types/calendar/machineEvent";

function createInitialState(
  scope: CalendarScope
): InitialState {
  return {
    status: machineStates.INITIAL,
    scope
  }
}

interface UseCalendarMachineResult {
  state: CalendarMachineState,
  dispatch: React.Dispatch<CalendarMachineEvent>
}

export function useCalendarMachine(
  scope: CalendarScope
): UseCalendarMachineResult {
  const [state, dispatch] = useReducer(
    calendarMachineReducer,
    scope,
    createInitialState
  )

  useEffect(() => {
    const scopeHasChanged = 
      state.scope.officeId !== scope.officeId ||
      state.scope.weekStart !== scope.weekStart

    if (!scopeHasChanged) {
      return;
    }

    dispatch({
      type: "SCOPE_CHANGED",
      officeId: scope.officeId,
      weekStart: scope.weekStart
    });
  }, [
    scope.officeId,
    scope.weekStart,
    state.scope.officeId,
    state.scope.weekStart
  ]);

  return {
    state,
    dispatch
  }
}

