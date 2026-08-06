import { createContext } from "react";
import type { CalendarRedisAttending } from "./CalendarRedisAttendingProvider";

export const CalendarRedisAttendingContext =
  createContext<CalendarRedisAttending | null>(null);
