import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useCurrentVisitsQuery, useVisitsQuery } from "@/util/api/queries/visitQueries";
import { CalendarMachineProvider } from "@/contexts/CalendarMachineProvider";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import CalendarPageSkeleton from "@/components/feedback/CalendarSkeletonLoader";
import { type CalendarData, CalendarDataProvider } from "@/contexts/CalendarDataProvider";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { useMemo } from "react";
import { CalendarRedisPlanningProvider } from "@/contexts/CalendarRedisPlanningProvider";
import { resolvePlanningSelectedDates } from "@/util/calendar/machine/bootstrapSelectedDatesResolver";
import { isDefaultScheduleDay } from "@/util/calendar/schedule/scheduleFilter";
import { generateDateKey } from "@/util/dates/date";
import { useOfficeAttending } from "@/util/cable/attendance/useOfficeAttending";
import { CalendarRedisAttendingProvider } from "@/contexts/CalendarRedisAttendingProvider";

interface CalendarWorkspaceRootProps {
  children: React.ReactNode;
}

export default function CalendarWorkspaceRoot({
  children
}: CalendarWorkspaceRootProps) {
  const scope = useCalendarScope();

  const weekDateKeys = useMemo(
    () => scope.weekDates.map((day) => day.key),
    [scope.weekDates]
  );
  const weekDates = useMemo(
    () => scope.weekDates.map((day) => day.date),
    [scope.weekDates]
  );

  const attendanceConfirmationsQuery = useAttendanceConfirmationsQuery({
    officeId: scope.activeOffice.id,
    startsOn: scope.focusedWeekStartKey
  });

  const currentUserVisitsQuery = useCurrentVisitsQuery({
    date: scope.focusedWeekStartKey,
    view: "week"
  });

  const officeRosterQuery = useOfficeRosterQuery(scope.activeOffice.id);

  const relevantVisitsQuery = useVisitsQuery({
    office_id: scope.activeOffice.id,
    date: scope.focusedWeekStartKey,
    view: "week"
  });

  const planning = useOfficePlanning({
    officeId: scope.activeOffice.id,
    currentUserId: scope.user.id,
    dates: weekDateKeys
  });

  const attending = useOfficeAttending({
    officeId: scope.activeOffice.id,
    weekStart: scope.focusedWeekStartKey,
    currentUserId: scope.user.id
  })

  if (
    attendanceConfirmationsQuery.isPending ||
    currentUserVisitsQuery.isPending ||
    officeRosterQuery.isPending ||
    relevantVisitsQuery.isPending ||
    !planning.hasInitialSnapshot
  ) {
    return <CalendarPageSkeleton />
  }

  if (
    attendanceConfirmationsQuery.isError ||
    currentUserVisitsQuery.isError ||
    officeRosterQuery.isError ||
    relevantVisitsQuery.isError
  ) {
    return <div>Unable to load calendar</div>
  }

  const currentUserOfficeVisitDates = new Set(
    currentUserVisitsQuery.data
      .filter((visit) => visit.office_id === scope.activeOffice.id)
      .map((visit) => visit.visit_date),
  );

  const currentUserExternalVisitDates = new Set(
    currentUserVisitsQuery.data
      .filter((visit) => visit.office_id !== scope.activeOffice.id)
      .map((visit) => visit.visit_date)
  );

  const baseSelectedDates = new Set(currentUserOfficeVisitDates);

  for (const date of weekDates) {
    const dateKey = generateDateKey(date);

    if (
      isDefaultScheduleDay(scope.user, date) &&
      !currentUserExternalVisitDates.has(dateKey)
    ) {
      baseSelectedDates.add(dateKey);
    }
  }

  const allSelectedDates: string[] = resolvePlanningSelectedDates({
    baseSelectedDates: [...baseSelectedDates],
    planningStatesByDate: planning.planningStatesByDate,
    currentUserId: scope.user.id,
    weekDateKeys: weekDateKeys
  });

  const isCurrentUserConfirmed: boolean = attendanceConfirmationsQuery.data.some(
    (confirmation) => confirmation.user_id === scope.user.id
  );


  const bootstrap: CalendarMachineBootstrap = {
    scope: {
      activeOfficeId: scope.activeOffice.id,
      focusedWeekStartKey: scope.focusedWeekStartKey
    },
    isConfirmed: isCurrentUserConfirmed,
    selectedDates: allSelectedDates
  }

  const calendarData: CalendarData = {
    rosterUsers: officeRosterQuery.data ?? [],
    visits: relevantVisitsQuery.data ?? [],
    currentUserVisits: currentUserVisitsQuery.data ?? [],
    attendanceConfirmations: attendanceConfirmationsQuery.data ?? []
  }

  return (
    <CalendarDataProvider value={calendarData}>
      <CalendarRedisPlanningProvider value={planning}>
        <CalendarRedisAttendingProvider value={attending}>
          <CalendarMachineProvider
            key={`${scope.activeOffice.id}:${scope.focusedWeekStartKey}`}
            bootstrap={bootstrap}
            activeOfficeId={scope.activeOffice.id}
            focusedWeekStartKey={scope.focusedWeekStartKey}
          >
            {children}
          </CalendarMachineProvider>
        </CalendarRedisAttendingProvider>
      </CalendarRedisPlanningProvider>
    </CalendarDataProvider>
  )
}
