import { useContext } from "react";

import { CalendarRedisAttendingContext } from "@/contexts/CalendarRedisAttendingContext";

export function useCalendarRedisAttendingContext() {
  const attendingContext = useContext(CalendarRedisAttendingContext);

  if (!attendingContext) {
    throw new Error(
      "useCalendarRedisAttendingContext must be used within CalendarRedisAttendingProvider",
    );
  }

  return attendingContext;
}
