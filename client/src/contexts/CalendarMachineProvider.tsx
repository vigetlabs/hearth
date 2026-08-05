import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { calendarMachineReducer } from "@/util/calendar/machine/machineTransitioner";
import { useMemo, useReducer } from "react";
import { CalendarMachineContext } from "./CalendarMachineContext";
import { machineStates, type CalendarMachineState, type ConfirmedState, type PlanningState } from "@/types/calendar/machine/machineState";
import { useCalendarMachineEffects } from "@/hooks/data/useCalendarMachineEffects";

interface CalendarMachineProviderProps {
  bootstrap: CalendarMachineBootstrap;
  activeOfficeId: number;
  focusedWeekStartKey: string;
  children: React.ReactNode;
}

export function CalendarMachineProvider({
  bootstrap,
  activeOfficeId,
  focusedWeekStartKey,
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

  useCalendarMachineEffects({
    state,
    dispatch,
    activeOfficeId,
    focusedWeekStartKey
  });

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
  const selectedDates = [...bootstrap.selectedDates];

  if (bootstrap.isConfirmed) {
    const confirmedState: ConfirmedState = {
      status: machineStates.CONFIRMED,
      scope: bootstrap.scope,
      confirmedDates: selectedDates
    }

    console.log("CONFIRMED STATE");
    return confirmedState;
  }

  const planningState: PlanningState = {
    status: machineStates.PLANNING,
    scope: bootstrap.scope,
    draftDates: selectedDates
  }

    console.log("PLANNING STATE");
  return planningState
}
