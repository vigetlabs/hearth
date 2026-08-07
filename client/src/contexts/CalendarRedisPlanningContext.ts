import { createContext } from "react";
import type { CalendarRedisPlanning } from "./CalendarRedisPlanningProvider";

export const CalendarRedisPlanningContext =
  createContext<CalendarRedisPlanning | null>(null);
