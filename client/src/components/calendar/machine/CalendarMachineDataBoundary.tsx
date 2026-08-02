import CalendarPageSkeleton from "@/components/feedback/CalendarSkeletonLoader";
import { CalendarMachineProvider } from "@/contexts/CalendarMachineProvider";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useCurrentVisitsQuery, useVisitsQuery } from "@/util/api/queries/visitQueries";


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

  const visits = useCurrentVisitsQuery({
    date: scope.focusedWeekStartKey,
    view: "week",
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
    isConfirmed: attendanceConfirmation.data.length > 0,
    selectedDates: visits.data.map((visit) => visit.visit_date)
  }

  console.log(bootstrap);

  return (
    <CalendarMachineProvider bootstrap={bootstrap}>
      {children}
    </CalendarMachineProvider>
  )
}
