import type { CalendarScope } from "@/types/calendar/scope";
import { createContext, useContext } from "react";



interface CalendarScopeProviderProps {
  value: CalendarScope;
  children: React.ReactNode;
}

const CalendarScopeContext =
  createContext<CalendarScope | null>(null);

export function CalendarScopeProvider({
  value,
  children
}: CalendarScopeProviderProps) {
  return (
    <CalendarScopeContext.Provider value={value}>
      {children}
    </CalendarScopeContext.Provider>
  )
}

export function useCalendarScope(): CalendarScope {
  const scope = useContext(CalendarScopeContext);

  if (!scope) {
    throw new Error(
      "useCalendarScope must be used within CalendarScopeProvider"
    );
  }

  return scope;
}
