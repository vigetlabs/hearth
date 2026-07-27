import { useContext } from "react";
import {
  type CalendarScope,
  CalendarScopeContext,
} from "@/contexts/CalendarScopeContext";

export function useCalendarScope(): CalendarScope {
  const scope = useContext(CalendarScopeContext);

  if (!scope) {
    throw new Error(
      "useCalendarScope must be used within CalendarScopeProvider",
    );
  }

  return scope;
}
