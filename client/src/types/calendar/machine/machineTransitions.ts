import { machineStates, type CalendarMachineStatus } from "./machineState";

export const validStateTransitions = {
  [machineStates.PLANNING]: [machineStates.CONFIRMING, machineStates.CONFIRMED],
  [machineStates.CONFIRMING]: [machineStates.PLANNING, machineStates.CONFIRMED],
  [machineStates.CONFIRMED]: [machineStates.EDITING],
  [machineStates.EDITING]: [machineStates.CONFIRMED, machineStates.PLANNING],
} satisfies Record<CalendarMachineStatus, readonly CalendarMachineStatus[]>;
