import {
  CalendarScopeContext,
  type CalendarScope,
} from "./CalendarScopeContext";

interface CalendarScopeProviderProps {
  value: CalendarScope;
  children: React.ReactNode;
}

export function CalendarScopeProvider({
  value,
  children,
}: CalendarScopeProviderProps) {
  return (
    <CalendarScopeContext.Provider value={value}>
      {children}
    </CalendarScopeContext.Provider>
  );
}
