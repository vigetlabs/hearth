import { machineStates, type CalendarMachineStatus } from "./machineState"

export const validStateTransitions = {
  [machineStates.INITIAL]: [
    machineStates.PLANNING,
    machineStates.CONFIRMED
  ],

  [machineStates.PLANNING]: [
    machineStates.CONFIRMING,
    machineStates.CONFIRMED,
    machineStates.INITIAL
  ],

  [machineStates.CONFIRMING]: [
    machineStates.PLANNING,
    machineStates.CONFIRMED,
    machineStates.INITIAL
  ],

  [machineStates.CONFIRMED]: [
    machineStates.PLANNING,
    machineStates.INITIAL
  ]
} satisfies Record<
  CalendarMachineStatus,
  readonly CalendarMachineStatus[]
>
