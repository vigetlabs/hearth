import type { CalendarMachineCapabilities } from "@/types/calendar/machineCapabilities";
import { machineStates, type CalendarMachineState, type CalendarMachineStatus } from "@/types/calendar/machineState";

export function getCapabilitiesFor(
  curState: CalendarMachineState
): CalendarMachineCapabilities {
  return capabilitiesByStatus[curState.status];
}

const noCapabilities: CalendarMachineCapabilities = {
  canChangeDates: false,
  canConfirm: false,
  canStartEditing: false,
}

const capabilitiesByStatus = {
  [machineStates.PLANNING]: {
    ...noCapabilities,
    canChangeDates: true,
    canConfirm: true
  },

  [machineStates.CONFIRMING]: noCapabilities,

  [machineStates.CONFIRMED]: {
    ...noCapabilities,
    canStartEditing: true
  }
} satisfies Record<
  CalendarMachineStatus,
  CalendarMachineCapabilities
>
