import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";
import { machineStates, type CalendarMachineState, type CalendarMachineStatus, type ConfirmedState, type ConfirmingState, type EditingState, type PlanningState } from "@/types/calendar/machine/machineState";
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
      return transitionFromPlanning(currentState, evt)
    }
    case machineStates.CONFIRMING: {
      return trasitionFromConfirming(currentState, evt)
    }
    case machineStates.CONFIRMED: {
      return transitionFromConfirmed(currentState, evt)
    }
    case machineStates.EDITING: {
      return transitionFromEditing(currentState, evt)
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
  switch (evt.type) {
    case "DATE_SELECTED": {
      const nextState: PlanningState = {
        ...currentState,
        draftDates: currentState.draftDates.includes(evt.date)
          ? currentState.draftDates
          : [...currentState.draftDates, evt.date]
      }
      return nextState;
    }

    case "DATE_DESELECTED": {
      const draftDates = new Set(currentState.draftDates);
      draftDates.delete(evt.date);

      const nextState: PlanningState = {
        ...currentState,
        draftDates: currentState.draftDates.filter(
          (date) => date !== evt.date
        )
      }
      return nextState;
    }

    case "CONFIRM_WEEK_REQUESTED": {
      const nextState: ConfirmingState = {
        ...currentState,
        status: machineStates.CONFIRMING
      }

      return nextState;
    }
  }
}

function trasitionFromConfirming(
  currentState: ConfirmingState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (evt.type) {
    case "CONFIRM_WEEK_COMPLETED": {
      const nextState: ConfirmedState = {
        ...currentState,
        status: machineStates.CONFIRMED,
        confirmedDates: [...currentState.draftDates]
      }
      return nextState;
    }

    case "CONFIRM_WEEK_FAILED": {
      const nextState: PlanningState = {
        ...currentState,
        status: machineStates.PLANNING
      }
      return nextState
    }
  }
}

function transitionFromConfirmed(
  currentState: ConfirmedState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (evt.type) {
    case "EDIT_WEEK_REQUESTED": {
      const nextState: EditingState = {
        ...currentState,
        status: machineStates.EDITING,
      }
      return nextState;
    }
    case "EDIT_WEEK_FAILED": {
      const nextState: ConfirmedState = {
        ...currentState
      }
      return nextState;
    }
    case "EDIT_WEEK_COMPLETED": {
      const nextState: PlanningState = {
        ...currentState,
        status: machineStates.PLANNING,
        draftDates: [...currentState.confirmedDates]
      }
      return nextState
    }

    default:
      return currentState;
  }
}

function transitionFromEditing(
  currentState: EditingState,
  evt: CalendarMachineEvent
): CalendarMachineState {
  switch (evt.type) {
    case "EDIT_WEEK_COMPLETED": {
      const nextState: PlanningState = {
        ...currentState,
        status: machineStates.PLANNING,
        draftDates: [...currentState.confirmedDates]
      }
      return nextState;
    }
    case "EDIT_WEEK_FAILED": {
      const nextState: ConfirmedState = {
        ...currentState,
        status: machineStates.CONFIRMED
      }
      return nextState
    }
  }
}
