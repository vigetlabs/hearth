import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useCurrentVisitsQuery, useVisitsQuery } from "@/util/api/queries/visitQueries";
import { CalendarMachineProvider } from "@/contexts/CalendarMachineProvider";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import CalendarPageSkeleton from "@/components/feedback/CalendarSkeletonLoader";
import { type CalendarData, CalendarDataProvider } from "@/contexts/CalendarDataProvider";

interface CalendarWorkspaceRootProps {
  children: React.ReactNode;
}

export default function CalendarWorkspaceRoot({
  children
}: CalendarWorkspaceRootProps) {
  const scope = useCalendarScope();

  const attendanceConfirmationsQuery = useAttendanceConfirmationsQuery({
    officeId: scope.activeOffice.id,
    startsOn: scope.focusedWeekStartKey
  });

  const currentUserVisitsQuery = useCurrentVisitsQuery({
    date: scope.focusedWeekStartKey,
    view: "week"
  });

  const officeRosterQuery = useOfficeRosterQuery(scope.activeOffice.id);

  const officeVisitsQuery = useVisitsQuery({
    office_id: scope.activeOffice.id,
    date: scope.focusedWeekStartKey,
    view: "week"
  });

  if (
    attendanceConfirmationsQuery.isPending ||
    currentUserVisitsQuery.isPending ||
    officeRosterQuery.isPending ||
    officeVisitsQuery.isPending
  ) {
    return <CalendarPageSkeleton />
  }

  if (
    attendanceConfirmationsQuery.isError ||
    currentUserVisitsQuery.isError ||
    officeRosterQuery.isError ||
    officeVisitsQuery.isError
  ) {
    return <div>Unable to load calendar</div>
  }

  const bootstrap: CalendarMachineBootstrap = {
    scope: {
      activeOfficeId: scope.activeOffice.id,
      focusedWeekStartKey: scope.focusedWeekStartKey
    },
    isConfirmed: attendanceConfirmationsQuery.data.length > 0,
    selectedDates: currentUserVisitsQuery.data.map((visit) => visit.visit_date)
  }

  const calendarData: CalendarData = {
    rosterUsers: officeRosterQuery.data ?? [],
    visits: officeVisitsQuery.data ?? [],
    currentUserVisits: currentUserVisitsQuery.data ?? [],
    attendanceConfirmations: attendanceConfirmationsQuery.data ?? []
  }

  return (
    <CalendarDataProvider value={calendarData}>
      <CalendarMachineProvider
        key={`${scope.activeOffice.id}:${scope.focusedWeekStartKey}`}
        bootstrap={bootstrap}
        activeOfficeId={scope.activeOffice.id}
        focusedWeekStartKey={scope.focusedWeekStartKey}
      >
        {children}
      </CalendarMachineProvider>
    </CalendarDataProvider>
  )
}
