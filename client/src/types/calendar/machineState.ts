const states = {
  INITIAL: "INITIAL",
  PLANNING: "PLANNING",
  CONFIRMING: "CONFIRMING",
  CONFIRMED: "CONFIRMED",
  // STARTING_EDIT: "STARTING_EDIT",
  // EDITING: "EDITING",
  // SAVING_EDITS: "SAVING_EDITS"
} as const;

interface CalendarScope {
  officeId: number;
  weekStart: string;
}

export interface InitialState {
  status: typeof states.INITIAL;
  scope: CalendarScope;
}

export interface PlanningState {
  status: typeof states.PLANNING;
  scope: CalendarScope;
  draftDates: ReadonlySet<string>;
}

export interface InitialState {
  status: typeof states.INITIAL;
  scope: CalendarScope;
}

export interface ConfirmingState {
  status: typeof states.CONFIRMING;
  scope: CalendarScope;
  draftDates: ReadonlySet<string>;
}

export interface ConfirmedState {
  status: typeof states.CONFIRMED;
  scope: CalendarScope;
  confirmedDates: ReadonlySet<string>;
}

// export interface StartingEditState {
//   status: typeof states.STARTING_EDIT;
//   scope: CalendarScope;
//   confirmedDates: ReadonlySet<string>;
// }

// export interface EditingState {
//   status: typeof states.INITIAL;
//   scope: CalendarScope;
//   confirmedDates: ReadonlySet<string>;
//   draftDates: ReadonlySet<string>;
// }

// export interface SavingEditsState {
//   status: typeof states.SAVING_EDITS;
//   scope: CalendarScope;
//   confirmedDates: ReadonlySet<string>;
//   draftDates: ReadonlySet<string>;
// }

export type CalendarMachineState =
  | InitialState
  | PlanningState
  | ConfirmingState
  | ConfirmedState
