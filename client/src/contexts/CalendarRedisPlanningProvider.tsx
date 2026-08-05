import type { OfficeDatesPlanningOverrideStates } from "@/types/cable/officePlanning";
import { CalendarRedisPlanningContext } from "./CalendarRedisPlanningContext";

export interface CalendarRedisPlanning {
  planningStatesByDate: OfficeDatesPlanningOverrideStates;
  hasInitialSnapshot: boolean;
  isConnected: boolean;
  selectDate: (dateKey: string) => void;
  deselectDate: (dateKey: string) => void;
}

interface CalendarRedisPlanningProviderProps {
  value: CalendarRedisPlanning;
  children: React.ReactNode;
}


export function CalendarRedisPlanningProvider({
  value,
  children
}: CalendarRedisPlanningProviderProps) {
  return (
    <CalendarRedisPlanningContext.Provider value={value}>
      {children}
    </CalendarRedisPlanningContext.Provider>
  )
}
