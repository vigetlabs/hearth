import { createContext } from "react";

import type { CalendarData } from "./CalendarDataProvider";

export const CalendarDataContext = createContext<CalendarData | null>(null);
