import { useContext } from "react";

import { CalendarRedisPlanningContext } from "@/contexts/CalendarRedisPlanningContext";

export function useCalendarRedisPlanningContext() {
  const planningContext = useContext(CalendarRedisPlanningContext);

  if (!planningContext) {
    throw new Error(
      "useCalendarRedisPlanningContext must be used within CalendarRedisPlanningProvider"
    );
  }

  return planningContext;
}
