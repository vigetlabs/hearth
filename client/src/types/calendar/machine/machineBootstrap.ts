import type { CalendarMachineScope } from "./machineState";

export interface CalendarMachineBootstrap {
  scope: CalendarMachineScope;
  isConfirmed: boolean;
  selectedDates: readonly string[];
}
