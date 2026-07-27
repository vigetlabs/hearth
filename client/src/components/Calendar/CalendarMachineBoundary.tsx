import { useCalendarData } from "@/hooks/useCalendarData";
import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";
import type { CalendarMachineBootstrap } from "@/types/calendar/machineEvent";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { CalendarMachineProvider } from "@/util/calendar/MachineProvider";
import CalendarWorkspace from "./CalendarWorkspace";


export default function CalendarMachineBoundary() {
  const {
    user,
    activeOffice,
    focusedWeekStartKey
  } = useCalendarScope();

  const calendarData = useCalendarData({
    officeId: activeOffice.id,
    weekStartKey: focusedWeekStartKey
  });

  if (calendarData.isPending) {
    return <CalendarPageSkeleton />
  }

  if (calendarData.isError) {
    return <div>Unable to load calendar data</div>
  }

  const isCurrentUserConfirmed =
    calendarData.attendanceConfirmations.some(
      (confirmation) =>
        confirmation.user_id === user.id
  );

  const selectedDates = calendarData.visits
    .filter(
      (visit) =>
        visit.user.id === user.id &&
        visit.office_id === activeOffice.id
    )
    .map((visit) => visit.visit_date);

  const bootstrap: CalendarMachineBootstrap = {
    scope: {
      officeId: activeOffice.id,
      weekStart: focusedWeekStartKey
    },
    confirmed: isCurrentUserConfirmed,
    selectedDates
  };

  const machineKey = `${activeOffice.id}:${focusedWeekStartKey}`;

  return (
    <CalendarMachineProvider
      key={machineKey}
      bootstrap={bootstrap}
    >
      <CalendarWorkspace data={calendarData} />
    </CalendarMachineProvider>
  )
}
