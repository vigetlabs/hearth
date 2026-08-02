import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { calendarMachineReducer } from "@/util/calendar/machine/machineTransitioner";
import { useMemo, useReducer } from "react";
import { CalendarMachineContext } from "./CalendarMachineContext";
import { machineStates, type CalendarMachineState, type ConfirmedState, type PlanningState } from "@/types/calendar/machine/machineState";

interface CalendarMachineProviderProps {
  bootstrap: CalendarMachineBootstrap;
  children: React.ReactNode;
}

export function CalendarMachineProvider({
  bootstrap,
  children
}: CalendarMachineProviderProps) {
  const [state, dispatch] = useReducer(
    calendarMachineReducer,
    bootstrap,
    createCalendarMachineInitialState
  );

  const contextValue = useMemo(
    () => ({
      state,
      dispatch
    }),
    [state],
  );



  return (
    <CalendarMachineContext.Provider
      value={contextValue}
    >
      {children}
    </CalendarMachineContext.Provider>
  )
}

function createCalendarMachineInitialState(
  bootstrap: CalendarMachineBootstrap
): CalendarMachineState {
  const selectedDates = new Set(bootstrap.selectedDates);

  if (bootstrap.isConfirmed) {
    const confirmedState: ConfirmedState = {
      status: machineStates.CONFIRMED,
      scope: bootstrap.scope,
      confirmedDates: selectedDates
    }

    return confirmedState;
  }

  const planningState: PlanningState = {
    status: machineStates.PLANNING,
    scope: bootstrap.scope,
    draftDates: selectedDates
  }

  return planningState
}
