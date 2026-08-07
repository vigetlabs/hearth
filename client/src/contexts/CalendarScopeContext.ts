import { createContext } from "react";

import type { Office } from "@/types/api/offices";
import type { User } from "@/types/api/users";
import type { CalendarDay } from "@/types/calendar/dates/calendarDay";

export interface CalendarScope {
  user: User;
  offices: readonly Office[];
  activeOffice: Office;
  focusedWeekStart: Date;
  focusedWeekStartKey: string;
  changeOffice: (office: Office) => void;
  changeWeek: (nextWeek: Date) => void;
  weekDates: readonly CalendarDay[];
}

export const CalendarScopeContext = createContext<CalendarScope | null>(null);
