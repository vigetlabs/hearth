import type { calendarEvents } from "@/util/calendar/machine/calendarEvents";

type CalendarEventGenerator = 
  (typeof calendarEvents)[keyof typeof calendarEvents];

export type CalendarMachineEvent = ReturnType<CalendarEventGenerator>;
