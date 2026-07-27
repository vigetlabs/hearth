import { createContext } from "react";

import type { CalendarData } from "@/hooks/useCalendarData";

export const CalendarDataContext = createContext<CalendarData | null>(null);
