export const machineStates = {
  PLANNING: "PLANNING",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
  EDITING: "EDITING"
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
  draftDates: string[];
}

export interface ConfirmingState {
  status: typeof machineStates.CONFIRMING;
  scope: CalendarMachineScope;
  draftDates: string[];
}

export interface ConfirmedState {
  status: typeof machineStates.CONFIRMED;
  scope: CalendarMachineScope;
  confirmedDates: string[];
}

export interface EditingState {
  status: typeof machineStates.EDITING;
  scope: CalendarMachineScope;
  confirmedDates: string[];
}

export type CalendarMachineState =
  | PlanningState
  | ConfirmingState
  | ConfirmedState
  | EditingState
