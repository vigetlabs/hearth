import type { CalendarScope } from "./machineState";

export type CalendarMachineEvent =
  | {
      type: "WEEK_LOADED";
      confirmed: boolean;
      selectedDates: readonly string[];
    }
  | {
      type: "DATE_SELECTED";
      date: string;
    }
  | {
      type: "DATE_DESELECTED";
      date: string;
    }
  | {
      type: "CONFIRM_REQUESTED";
    }
  | {
      type: "CONFIRM_SUCCEEDED";
      selectedDates: readonly string[];
    }
  | {
      type: "CONFIRM_FAILED";
    }
  | {
      type: "EDIT_REQUESTED";
    }
  | {
      type: "EDIT_CANCELLED";
    }
  | {
      type: "SAVE_EDITS_REQUESTED";
    }
  | {
      type: "SAVE_EDITS_SUCCEEDED";
      selectedDates: readonly string[];
    }
  | {
      type: "SAVE_EDITS_FAILED";
    }
  | {
      type: "SERVER_SYNCHRONIZED";
      confirmed: boolean;
      selectedDates: readonly string[];
    }

export interface CalendarMachineBootstrap {
  scope: CalendarScope;
  confirmed: boolean;
  selectedDates: readonly string[];
}
