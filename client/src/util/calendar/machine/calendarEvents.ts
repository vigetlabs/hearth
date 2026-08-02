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
  }
};
