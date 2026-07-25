import type { CalendarMachineEvent } from "@/types/calendar/machineEvent";
import { 
  machineStates,
  type CalendarMachineState,
  type CalendarMachineStatus, 
  type ConfirmedState, 
  type ConfirmingState, 
  type InitialState, 
  type PlanningState
} from "@/types/calendar/machineState";
import { validStateTransitions } from "@/types/calendar/machineTransitions";

export function isValidTransition(
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

function transitionFromInitial(
  curState: InitialState,
  evt: CalendarMachineEvent
):  CalendarMachineState {
  switch (evt.type) {
    case "WEEK_LOADED": {
      const dates = new Set(evt.selectedDates);

      if (evt.confirmed) {
        const nextState: ConfirmedState = {
          status: machineStates.CONFIRMED,
          scope: curState.scope,
          confirmedDates: dates
        }
        return nextState
      }

      const nextState: PlanningState = {
        status: machineStates.PLANNING,
        scope: curState.scope,
        draftDates: dates
      }

      return nextState;
    }

    case "SCOPE_CHANGED": {
      const nextState: InitialState = {
        status: machineStates.INITIAL,
        scope: {
          officeId: evt.officeId,
          weekStart: evt.weekStart
        }
      }
      return nextState;
    }

    default:
      console.error("Invalid event");
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

    case "SCOPE_CHANGED": {
      const nextState: InitialState = {
        status: machineStates.INITIAL,
        scope: {
          officeId: evt.officeId,
          weekStart: evt.weekStart
        }
      }
      return nextState;
    }

    default:
      console.error("Invalid event");
  }
}
