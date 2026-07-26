import { machineStates, type CalendarMachineState, type PlanningState } from "@/types/calendar/machineState";

export function isDateEditableState(
  curState: CalendarMachineState
): curState is PlanningState {
  return (
    curState.status === machineStates.PLANNING
  )
}
