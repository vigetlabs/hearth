import { createContext } from "react";

import type { CalendarData } from "@/hooks/data/useCalendarData";

export const CalendarDataContext = createContext<CalendarData | null>(null);
