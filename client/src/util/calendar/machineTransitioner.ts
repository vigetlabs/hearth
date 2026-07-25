import type { CalendarMachineEvent } from "@/types/calendar/machineEvent";
import { 
  machineStates,
  type CalendarMachineState,
  type CalendarMachineStatus, 
  type ConfirmedState, 
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
  event: CalendarMachineEvent
):  CalendarMachineState {
  switch (event.type) {
    case "WEEK_LOADED": {
      const dates = new Set(event.selectedDates);

      if (event.confirmed) {
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
          officeId: event.officeId,
          weekStart: event.weekStart
        }
      }
      return nextState;
    }

    default:
      console.error("Invalid event");
  }
}
