import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";
import { machineStates, type CalendarMachineState, type CalendarMachineStatus, type ConfirmingState, type PlanningState } from "@/types/calendar/machine/machineState";
import { validStateTransitions } from "@/types/calendar/machine/machineTransitions";


export function calendarMachineReducer(
  currentState: CalendarMachineState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  const nextState = transitionReduce(currentState, evt);

  assertValidTransition(currentState, evt, nextState);

  return nextState;
}

function assertValidTransition(
  prev: CalendarMachineState,
  evt: CalendarMachineEvent,
  nextState: CalendarMachineState
): void {
  if (isValidTransition(prev.status, nextState.status)) {
    return;
  }

  throw new Error(
    [
      "Invalid calendar transition.",
      `State: ${prev.status}.`,
      `Event: ${evt.type}.`,
      `Result: ${nextState.status}.`,
    ].join(" ")

  )
}

function isValidTransition(
  prev: CalendarMachineStatus,
  after: CalendarMachineStatus
): boolean {
  if (prev === after) {
    return true;
  }

  const allowedTransitions: readonly CalendarMachineStatus[] =
    validStateTransitions[prev]

  return allowedTransitions.includes(after);
}

function transitionReduce(
  currentState: CalendarMachineState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (currentState.status) {
    case machineStates.PLANNING: {
      return transitionFromConfirmed(currentState, evt)
    }
    case machineStates.CONFIRMING: {
      return trasitionFromConfirming(currentState, evt)
    }
    case machineStates.CONFIRMED: {
      return transitionFromConfirmed(currentState, evt)
    }
    default: {
      console.error("Invalid transition reduce");
    }
  }
}


function transitionFromPlanning(
  currentState: PlanningState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  return currentState
}

function trasitionFromConfirming(
  currentState: ConfirmingState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  return currentState
}

function transitionFromConfirmed(
  currentState: CalendarMachineState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  return currentState
}
