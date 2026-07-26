import type { CalendarMachineBootstrap, CalendarMachineEvent } from "@/types/calendar/machineEvent";
import { machineStates, type CalendarMachineState, type ConfirmedState, type PlanningState } from "@/types/calendar/machineState";
import { createContext, useContext, useMemo, useReducer, type Dispatch } from "react";
import { calendarMachineReducer } from "./machineTransitioner";


interface CalendarMachineContextValue {
  state: CalendarMachineState;
  dispatch: Dispatch<CalendarMachineEvent>
}

const CalendarMachineContext = 
  createContext<CalendarMachineContextValue | undefined>(undefined);

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
    createCalendarMachineState
  );

  const contextValue = useMemo<CalendarMachineContextValue>(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return (
    <CalendarMachineContext.Provider
    value={contextValue}
    >
      {children}
    </CalendarMachineContext.Provider>
  );
}

function createCalendarMachineState(
  bootstrap: CalendarMachineBootstrap
): CalendarMachineState {
  const selectedDates = new Set(bootstrap.selectedDates);

  if (bootstrap.confirmed) {
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

  return planningState;
}

export function useCalendarMachine(): CalendarMachineContextValue {
  const context = useContext(CalendarMachineContext);

  if (context === undefined) {
    throw new Error(
      "useCalendarMachine must be used within CalendarMachineProvider"
    )
  }

  return context;
}
