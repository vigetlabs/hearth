import CalendarPageSkeleton from "@/components/feedback/CalendarSkeletonLoader";
import { CalendarMachineProvider } from "@/contexts/CalendarMachineProvider";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useVisitsQuery } from "@/util/api/queries/visitQueries";


interface CalendarMachineDataBoundaryProps {
  children: React.ReactNode;
}

export default function CalendarMachineDataBoundary({
  children
}: CalendarMachineDataBoundaryProps) {
  const scope = useCalendarScope();

  const attendanceConfirmation = useAttendanceConfirmationsQuery({
    officeId: scope.activeOffice.id,
    startsOn: scope.focusedWeekStartKey
  });

  const visits = useVisitsQuery({
    date: scope.focusedWeekStartKey,
    view: "week",
    office_id: scope.activeOffice.id
  })

  if (attendanceConfirmation.isLoading || visits.isLoading)  {
    return <CalendarPageSkeleton />
  }

  if (attendanceConfirmation.isError || visits.isError) {
    return <div>Unable to load calendar</div>;
  }

  const bootstrap: CalendarMachineBootstrap = {
    scope: {
      activeOfficeId: scope.activeOffice.id,
      focusedWeekStartKey: scope.focusedWeekStartKey
    },
    isConfirmed: attendanceConfirmation.data !== null,
    selectedDates: visits.data.map((visit) => visit.visit_date)
  }

  return (
    <CalendarMachineProvider bootstrap={bootstrap}>
      {children}
    </CalendarMachineProvider>
  )
}
