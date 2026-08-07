import { useContext } from "react";

import { CalendarDataContext } from "@/contexts/CalendarDataContext";

export function useCalendarDataContext() {
  const data = useContext(CalendarDataContext);

  if (!data) {
    throw new Error(
      "useCalendarDataContext must be used within CalendarDataProvider",
    );
  }

  return data;
}
