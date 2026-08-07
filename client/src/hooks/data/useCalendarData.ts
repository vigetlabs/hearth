import type { AttendanceConfirmation } from "@/types/api/attendanceConfirmations";
import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";

import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import {
  useCurrentVisitsQuery,
  useVisitsQuery,
} from "@/util/api/queries/visitQueries";

interface UseCalendarDataOptions {
  userId: number;
  officeId: number;
  weekStartKey: string;
}

export interface CalendarData {
  rosterUsers: User[];
  visits: Visit[];
  currentUserVisits: Visit[];
  attendanceConfirmations: AttendanceConfirmation[];
  isPending: boolean;
  isError: boolean;
}

export function useCalendarData({
  officeId,
  weekStartKey,
}: UseCalendarDataOptions): CalendarData {
  const rosterQuery = useOfficeRosterQuery(officeId);

  const visitsQuery = useVisitsQuery({
    office_id: officeId,
    date: weekStartKey,
    view: "week",
  });

  const currentUserVisitsQuery = useCurrentVisitsQuery({
    date: weekStartKey,
    view: "week",
  });

  const confirmationsQuery = useAttendanceConfirmationsQuery({
    officeId,
    startsOn: weekStartKey,
  });

  return {
    rosterUsers: rosterQuery.data ?? [],
    visits: visitsQuery.data ?? [],
    currentUserVisits: currentUserVisitsQuery.data ?? [],
    attendanceConfirmations: confirmationsQuery.data ?? [],

    isPending:
      rosterQuery.isPending ||
      visitsQuery.isPending ||
      currentUserVisitsQuery.isPending ||
      confirmationsQuery.isPending,

    isError:
      rosterQuery.isError ||
      visitsQuery.isError ||
      currentUserVisitsQuery.isError ||
      confirmationsQuery.isError,
  };
}
