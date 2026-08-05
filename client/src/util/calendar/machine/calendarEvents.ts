export const calendarEvents = {
  dateSelected(dateKey: string) {
    return {
      type: "DATE_SELECTED" as const,
      date: dateKey,
    };
  },
  dateDeselected(dateKey: string) {
    return {
      type: "DATE_DESELECTED" as const,
      date: dateKey
    }
  },
  confirmWeekRequested() {
    return {
      type: "CONFIRM_WEEK_REQUESTED" as const
    };
  },
  confirmWeekCompleted() {
    return {
      type: "CONFIRM_WEEK_COMPLETED" as const
    }
  },
  confirmWeekFailed() {
    return {
      type: "CONFIRM_WEEK_FAILED" as const
    }
  },
  editWeekRequested() {
    return {
      type: "EDIT_WEEK_REQUESTED" as const
    }
  },
  editWeekCompleted() {
    return {
      type: "EDIT_WEEK_COMPLETED" as const
    }
  },
  editWeekFailed() {
    return {
      type: "EDIT_WEEK_FAILED" as const
    }
  },
};
