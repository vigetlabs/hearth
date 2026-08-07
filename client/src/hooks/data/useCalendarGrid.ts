import { useCallback, useMemo, type Dispatch } from "react";

import { useCalendarDataContext } from "@/hooks/contexts/useCalendarDataContext";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { Visit } from "@/types/api/visits";
import type { WeekSchedule } from "@/types/calendar/schedule/weekSchedule";
import { buildWeekSchedule } from "@/util/calendar/schedule/scheduleBuilder";
import {
  buildCalendarGridViewModel,
  type CalendarGridViewModel,
} from "@/util/calendar/viewModel/gridBuilder";
import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";
import { calendarEvents } from "@/util/calendar/machine/calendarEvents";
import { useCalendarRedisPlanningContext } from "../contexts/useCalendarRedisPlanningContext";
import { useCalendarRedisAttendingContext } from "../contexts/useCalendarRedisAttendingContext";

export interface UseCalendarGridResult {
  viewModel: CalendarGridViewModel;
  toggleCurrentUser: (dateKey: string) => void;
}

interface UseCalendarGridOptions {
  dispatch: Dispatch<CalendarMachineEvent>;
}

export function useCalendarGrid({
  dispatch,
}: UseCalendarGridOptions): UseCalendarGridResult {
  const scope = useCalendarScope();
  const data = useCalendarDataContext();

  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
  } = useCalendarRedisPlanningContext();

  const { editingUserIds } = useCalendarRedisAttendingContext();

  const weekDateKeys = useMemo(
    () => scope.weekDates.map((day) => day.key),
    [scope.weekDates],
  );

  const confirmedUserIds = useMemo(
    () =>
      new Set(
        data.attendanceConfirmations.map(
          (confirmation) => confirmation.user_id,
        ),
      ),
    [data.attendanceConfirmations],
  );

  const currentUserExternalVisitsByDate = useMemo(
    () =>
      new Map(
        data.currentUserVisits
          .filter((visit) => visit.office_id !== scope.activeOffice.id)
          .map((visit) => [visit.visit_date, visit]),
      ),
    [data.currentUserVisits, scope.activeOffice.id],
  );

  const officesById = useMemo(
    () => new Map(scope.offices.map((office) => [office.id, office])),
    [scope.offices],
  );

  const externalOfficeNamesByDate = useMemo(
    () =>
      mapExternalVisitDetails(
        currentUserExternalVisitsByDate,
        (officeId) => officesById.get(officeId)?.name ?? "another office",
      ),
    [currentUserExternalVisitsByDate, officesById],
  );

  const externalOfficeEmojisByDate = useMemo(
    () =>
      mapExternalVisitDetails(
        currentUserExternalVisitsByDate,
        (officeId) => officesById.get(officeId)?.emoji ?? "",
      ),
    [currentUserExternalVisitsByDate, officesById],
  );

  /* Contains visits relevant to office and week start being viewed and currentUserVisits.
   * It is necessary to do both so that when viewing an office and my external visits are considered
   * to be irrelevant by the relevant endpoint query, my visits will still show
   *
   * EX: My default office is Boulder, I have external visits at Durham. If I view Chatanooga, the
   * relevant endpoint would not fetch my Durham visits. `scheduleVisits` is necessary to include
   * such visits so that it properly displays for the current user (me), while still being able to
   * exclude those irrelevant visits for other users.
   */
  const scheduleVisits = useMemo(() => {
    const visitsById = new Map<number, Visit>();

    for (const visit of data.visits) {
      visitsById.set(visit.id, visit);
    }

    for (const visit of data.currentUserVisits) {
      visitsById.set(visit.id, visit);
    }

    return [...visitsById.values()];
  }, [data.visits, data.currentUserVisits]);

  const isWeekConfirmed = confirmedUserIds.has(scope.user.id);
  const isEditingWeek = editingUserIds.has(scope.user.id);
  const locked = isWeekConfirmed && !isEditingWeek;

  const schedule = useMemo<WeekSchedule>(
    () =>
      buildWeekSchedule({
        officeUsers: data.rosterUsers,
        relevantVisits: scheduleVisits,
        officesById,
        weekDateKeys,
        confirmedUserIds,
        editingUserIds,
        planningStatesByDate,
        activeOfficeId: scope.activeOffice.id,
        currentUserId: scope.user.id,
      }),
    [
      data.rosterUsers,
      scheduleVisits,
      officesById,
      weekDateKeys,
      confirmedUserIds,
      editingUserIds,
      planningStatesByDate,
      scope.activeOffice.id,
      scope.user.id,
    ],
  );

  const viewModel = useMemo(
    () =>
      buildCalendarGridViewModel({
        focusedWeekStart: scope.focusedWeekStart,
        schedule,
        planningByDate: planningStatesByDate,
        currentUserId: scope.user.id,
        editingUserIds,
        externalOfficeNamesByDate,
        externalOfficeEmojisByDate,
        locked,
      }),
    [
      scope.focusedWeekStart,
      scope.user.id,
      schedule,
      planningStatesByDate,
      editingUserIds,
      externalOfficeNamesByDate,
      externalOfficeEmojisByDate,
      locked,
    ],
  );

  const toggleCurrentUser = useCallback(
    (dateKey: string): void => {
      if (
        locked ||
        !isPlanningConnected ||
        currentUserExternalVisitsByDate.has(dateKey)
      ) {
        return;
      }

      const currentUserEntry = schedule[dateKey]?.find(
        (entry) => entry.user.id === scope.user.id,
      );

      const isEditing = editingUserIds.has(scope.user.id);

      if (currentUserEntry?.status === "confirmed-yes" && !isEditing) {
        return;
      }

      const currentlyAttending =
        currentUserEntry?.status === "confirmed-yes" ||
        currentUserEntry?.status === "planning-yes";

      if (currentlyAttending) {
        deselectDate(dateKey);
        dispatch(calendarEvents.dateDeselected(dateKey));
      } else {
        selectDate(dateKey);
        dispatch(calendarEvents.dateSelected(dateKey));
      }
    },
    [
      locked,
      isPlanningConnected,
      currentUserExternalVisitsByDate,
      schedule,
      editingUserIds,
      scope.user.id,
      deselectDate,
      selectDate,
      dispatch,
    ],
  );

  return {
    viewModel,
    toggleCurrentUser,
  };
}

function mapExternalVisitDetails(
  visitsByDate: ReadonlyMap<string, Visit>,
  getValue: (officeId: number) => string,
): ReadonlyMap<string, string> {
  return new Map(
    [...visitsByDate].map(([dateKey, visit]) => [
      dateKey,
      getValue(visit.office_id),
    ]),
  );
}
