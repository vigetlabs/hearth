import { CalendarRedisAttendingContext } from "./CalendarRedisAttendingContext";

export interface CalendarRedisAttending {
  editingUserIds: ReadonlySet<number>;
  startEditing: () => void;
  refreshEditingSnapshot: () => void;
}

interface CalendarRedisAttendingProviderProps {
  value: CalendarRedisAttending;
  children: React.ReactNode;
}

export function CalendarRedisAttendingProvider({
  value,
  children,
}: CalendarRedisAttendingProviderProps) {
  return (
    <CalendarRedisAttendingContext.Provider value={value}>
      {children}
    </CalendarRedisAttendingContext.Provider>
  );
}
