import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useCurrentVisitsQuery } from "@/util/api/queries/visitQueries";
import { CalendarMachineProvider } from "@/contexts/CalendarMachineProvider";

interface CalendarWorkspaceRootProps {
  children: React.ReactNode;
}

export default function CalendarWorkspaceRoot({
  children
}: CalendarWorkspaceRootProps) {
  const scope = useCalendarScope();

  const attendanceConfirmation = useAttendanceConfirmationsQuery({
    officeId: scope.activeOffice.id,
    startsOn: scope.focusedWeekStartKey
  });

  const currentUserVisits = useCurrentVisitsQuery({
    date: scope.focusedWeekStartKey,
    view: "week"
  });


  const bootstrap: CalendarMachineBootstrap = {
    scope: {
      activeOfficeId: scope.activeOffice.id,
      focusedWeekStartKey: scope.focusedWeekStartKey
    },
    isConfirmed: attendanceConfirmation.data.length > 0,
    selectedDates: currentUserVisits.data.map((visit) => visit.visit_date)
  }


  return (
    <CalendarMachineProvider 
      key={`${scope.activeOffice.id}:${scope.focusedWeekStartKey}`}
      bootstrap={bootstrap}
    >
      {children}
    </CalendarMachineProvider>
  )
}
