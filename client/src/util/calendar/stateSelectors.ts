import { machineStates, type CalendarMachineState, type ConfirmedState, type ConfirmingState, type PlanningState } from "@/types/calendar/machineState";

export function isPlanning(
  curState: CalendarMachineState
): curState is PlanningState {
  return  curState.status === machineStates.PLANNING;
}

export function isConfirmed(
  curState: CalendarMachineState
): curState is ConfirmedState {
  return curState.status === machineStates.CONFIRMED;
}


export function isBusy(
  curState: CalendarMachineState
): curState is ConfirmingState {
  return curState.status === machineStates.CONFIRMING;
}
