import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";
import type { CalendarMachineState } from "@/types/calendar/machine/machineState";
import { createContext, type Dispatch } from "react";

interface CalendarMachineContext {
  state: CalendarMachineState;
  dispatch: Dispatch<CalendarMachineEvent>
}

export const CalendarMachineContext =
  createContext<CalendarMachineContext | null>(null);
