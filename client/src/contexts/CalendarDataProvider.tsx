import { CalendarDataContext } from "./CalendarDataContext";
import type { CalendarData } from "@/hooks/useCalendarData";

interface CalendarDataProviderProps {
  value: CalendarData;
  children: React.ReactNode;
}

export function CalendarDataProvider({
  value,
  children,
}: CalendarDataProviderProps) {
  return (
    <CalendarDataContext.Provider value={value}>
      {children}
    </CalendarDataContext.Provider>
  );
}
