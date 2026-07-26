export const machineStates = {
  PLANNING: "PLANNING",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
} as const;

export type CalendarMachineStatus =
  (typeof machineStates)[keyof typeof machineStates];

export interface CalendarScope {
  officeId: number;
  weekStart: string;
}

export interface PlanningState {
  status: typeof machineStates.PLANNING;
  scope: CalendarScope;
  draftDates: ReadonlySet<string>;
}

export interface ConfirmingState {
  status: typeof machineStates.CONFIRMING;
  scope: CalendarScope;
  draftDates: ReadonlySet<string>;
}

export interface ConfirmedState {
  status: typeof machineStates.CONFIRMED;
  scope: CalendarScope;
  confirmedDates: ReadonlySet<string>;
}

export type CalendarMachineState =
  | PlanningState
  | ConfirmingState
  | ConfirmedState
