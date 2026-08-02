export type CalendarMachineEvent =
  | {
      type: "WEEK_LOADED";
      isConfirmed: boolean;
      selectedDates: readonly string[];
    }
  | {
      type: "DATE_SELECTED";
      date: string;
    }
