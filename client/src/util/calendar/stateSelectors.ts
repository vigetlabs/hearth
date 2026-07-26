import { machineStates, type CalendarMachineState, type ConfirmedState, type ConfirmingState, type PlanningState } from "@/types/calendar/machineState";

export function isPlanning(
  curState: CalendarMachineState
): curState is PlanningState {
  return  curState.status === machineStates.PLANNING;
}

export function isConfirmingState(
  curState: CalendarMachineState
): curState is ConfirmingState {
  return curState.status === machineStates.CONFIRMING;
}

export function isConfirmed(
  curState: CalendarMachineState
): curState is ConfirmedState {
  return curState.status === machineStates.CONFIRMED;
}

export function selectedDatesForMachine(
  curState: CalendarMachineState
): ReadonlySet<string> {
  switch (curState.status) {
    case machineStates.PLANNING: 
    case machineStates.CONFIRMING: {
      return curState.draftDates;
    }

    case machineStates.CONFIRMED: {
      return curState.confirmedDates;
    }
  }
}

export function isBusy(
  curState: CalendarMachineState
): boolean {
  return curState.status === machineStates.CONFIRMING;
}
