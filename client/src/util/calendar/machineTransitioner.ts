import type { CalendarMachineEvent } from "@/types/calendar/machineEvent";
import { 
  machineStates,
  type CalendarMachineState,
  type CalendarMachineStatus, 
  type ConfirmedState, 
  type ConfirmingState, 
  type PlanningState
} from "@/types/calendar/machineState";
import { validStateTransitions } from "@/types/calendar/machineTransitions";

export function calendarMachineReducer(
  curState: CalendarMachineState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  const nextState: CalendarMachineState = transitionReduce(curState, evt)

  assertValidTransition(curState, evt, nextState);

  return nextState;
}

function assertValidTransition(
  before: CalendarMachineState,
  evt: CalendarMachineEvent,
  after: CalendarMachineState
): void {
  if (isValidTransition(before.status, after.status)) {
    return;
  }

  throw new Error(
    [
      "Invalid calendar transition.",
      `State: ${before.status}.`,
      `Event: ${evt.type}.`,
      `Result: ${after.status}.`,
    ].join(" ")
  )
}

function isValidTransition(
  before: CalendarMachineStatus,
  after: CalendarMachineStatus
): boolean {
  if (before === after) {
    return true;
  }

  const allowedTransitions: readonly CalendarMachineStatus[] =
    validStateTransitions[before];

  return allowedTransitions.includes(after);
}

function transitionReduce(
  curState: CalendarMachineState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (curState.status) {
    case machineStates.PLANNING:
      return transitionFromPlanning(curState, evt)

    case machineStates.CONFIRMING:
      return transitionFromConfirming(curState, evt)

    case machineStates.CONFIRMED:
      return transitionFromConfirmed(curState, evt)

    default:
      console.error("Invalid transition");
  }
}

function transitionFromPlanning(
  curState: PlanningState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (evt.type) {
    case "DATE_SELECTED": {
      const nextState: PlanningState = {
        ...curState,
        draftDates: new Set(curState.draftDates).add(evt.date)
      }

      return nextState;
    }

    case "DATE_DESELECTED": {
      const draftDates: Set<string> = new Set(curState.draftDates);
      draftDates.delete(evt.date);

      const nextState: PlanningState = {
        ...curState,
        draftDates: draftDates
      }

      return nextState;
    }

    case "CONFIRM_REQUESTED": {
      const nextState: ConfirmingState = {
        status: machineStates.CONFIRMING,
        scope: curState.scope,
        draftDates: curState.draftDates
      }

      return nextState;
    }

    case "SERVER_SYNCHRONIZED": {
      if (evt.confirmed)  {
        const nextState: ConfirmedState = {
          status: machineStates.CONFIRMED,
          scope: curState.scope,
          confirmedDates: new Set(evt.selectedDates)
        }
        return nextState;
      }
      return curState;
    }

    default:
      console.error("Invalid event");
  }
}

function transitionFromConfirming(
  curState: ConfirmingState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (evt.type) {
    case "CONFIRM_SUCCEEDED": {
      const nextState: ConfirmedState = {
        status: machineStates.CONFIRMED,
        scope: curState.scope,
        confirmedDates: new Set(evt.selectedDates)
      }

      return nextState;
    }

    case "CONFIRM_FAILED": {
      const nextState: PlanningState = {
        status: machineStates.PLANNING,
        scope: curState.scope,
        draftDates: curState.draftDates
      }

      return nextState;
    }

    default:
      console.error("Invalid event");
  }
}

function transitionFromConfirmed(
  curState: CalendarMachineState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (evt.type) {
    case "SERVER_SYNCHRONIZED": {
      if (!evt.confirmed) {
        const nextState: PlanningState = {
          status: machineStates.PLANNING,
          scope: curState.scope,
          draftDates: new Set(evt.selectedDates)
        }
        return nextState;
      }

      const nextState: ConfirmedState = {
        status: machineStates.CONFIRMED,
        scope: curState.scope,
        confirmedDates: new Set(evt.selectedDates)
      }
      return nextState;
    }

    default:
      console.error("Invalid event");
  }
}
