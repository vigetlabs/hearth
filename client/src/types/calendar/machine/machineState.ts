export const machineStates = {
  PLANNING: "PLANNING",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED"
} as const;

export type CalendarMachineStatus =
  (typeof machineStates)[keyof typeof machineStates];

export interface CalendarMachineScope {
  activeOfficeId: number;
  focusedWeekStartKey: string;
}

export interface PlanningState {
  status: typeof machineStates.PLANNING;
  scope: CalendarMachineScope;
  draftDates: ReadonlySet<string>;
}

export interface ConfirmingState {
  status: typeof machineStates.CONFIRMING;
  scope: CalendarMachineScope;
  draftDates: ReadonlySet<string>;
}

export interface ConfirmedState {
  status: typeof machineStates.CONFIRMED;
  scope: CalendarMachineScope;
  confirmedDates: ReadonlySet<string>;
}

export type CalendarMachineState =
  | PlanningState
  | ConfirmingState
  | ConfirmedState
