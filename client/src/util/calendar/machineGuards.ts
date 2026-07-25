import { machineStates, type CalendarMachineState, type PlanningState } from "@/types/calendar/machineState";

export function isDateChangeState(
  curState: CalendarMachineState
): curState is PlanningState {
  return (
    curState.status === machineStates.PLANNING
  )
}
