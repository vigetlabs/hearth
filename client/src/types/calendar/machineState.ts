export const machineStates = {
  INITIAL: "INITIAL",
  PLANNING: "PLANNING",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
  // STARTING_EDIT: "STARTING_EDIT",
  // EDITING: "EDITING",
  // SAVING_EDITS: "SAVING_EDITS"
} as const;

export type CalendarMachineStatus =
  (typeof machineStates)[keyof typeof machineStates];

interface CalendarScope {
  officeId: number;
  weekStart: string;
}

export interface InitialState {
  status: typeof machineStates.INITIAL;
  scope: CalendarScope;
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
  | InitialState
  | PlanningState
  | ConfirmingState
  | ConfirmedState
