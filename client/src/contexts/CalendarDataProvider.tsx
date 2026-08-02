import type { User } from "@/types/api/users";
import { CalendarDataContext } from "./CalendarDataContext";
import type { Visit } from "@/types/api/visits";
import type { AttendanceConfirmation } from "@/types/api/attendanceConfirmations";

export interface CalendarData {
  rosterUsers: User[];
  visits: Visit[];
  currentUserVisits: Visit[]
  attendanceConfirmations: AttendanceConfirmation[];
}

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
