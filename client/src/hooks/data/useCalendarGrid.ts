import { useCallback, useMemo, type Dispatch } from "react";

import { useCalendarDataContext } from "@/hooks/contexts/useCalendarDataContext";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import type { Visit } from "@/types/api/visits";
import type { WeekSchedule } from "@/types/calendar/calendar";
import { useOfficeAttending } from "@/util/cable/attendance/useOfficeAttending";
import {
  baseAttendanceForUser,
  planningOverrideStateForUser,
  resolveAttendance,
  resolveEditingAttendance,
} from "@/util/cable/planning/overrideState";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import {
  buildCalendarGridViewModel,
  type CalendarGridViewModel,
  WEEKDAYS_PER_WEEK,
} from "@/util/calendar/viewModel/gridBuilder";
import { addDays, generateDateKey } from "@/util/dates/date";
import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";

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

  const weekDates = useMemo(
    () =>
      Array.from({ length: WEEKDAYS_PER_WEEK }, (_, index) =>
        addDays(scope.focusedWeekStart, index),
      ),
    [scope.focusedWeekStart],
  );

  const weekDateKeys = useMemo(
    () => weekDates.map(generateDateKey),
    [weekDates],
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

  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
  } = useOfficePlanning({
    officeId: scope.activeOffice.id,
    currentUserId: scope.user.id,
    dates: weekDateKeys,
  });

  const { editingUserIds } = useOfficeAttending({
    officeId: scope.activeOffice.id,
    weekStart: scope.focusedWeekStartKey,
    currentUserId: scope.user.id,
  });

  const isWeekConfirmed = confirmedUserIds.has(scope.user.id);
  const isEditingWeek = editingUserIds.has(scope.user.id);
  const locked = isWeekConfirmed && !isEditingWeek;

  const schedule = useMemo<WeekSchedule>(
    () =>
      buildWeekSchedule(
        data.rosterUsers,
        data.visits,
        weekDates,
        confirmedUserIds,
        scope.user.id,
        currentUserExternalVisitsByDate,
      ),
    [
      data.rosterUsers,
      data.visits,
      weekDates,
      confirmedUserIds,
      scope.user.id,
      currentUserExternalVisitsByDate,
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

      const baseDay = schedule[dateKey] ?? [];
      const { hasConfirmedVisit, isDefaultScheduleDay } = baseAttendanceForUser(
        {
          day: baseDay,
          userId: scope.user.id,
        },
      );

      const isEditing = editingUserIds.has(scope.user.id);

      if (hasConfirmedVisit && !isEditing) {
        return;
      }

      const planningOverrideState = planningOverrideStateForUser(
        planningStatesByDate[dateKey],
        scope.user.id,
      );

      const currentlyAttending = isEditing
        ? resolveEditingAttendance({
            hasConfirmedVisit,
            planningOverrideState,
          })
        : resolveAttendance({
            hasConfirmedVisit,
            planningOverrideState,
            isDefaultScheduleDay,
          });

      if (currentlyAttending) {
        deselectDate(dateKey);
      } else {
        selectDate(dateKey);
        dispatch({
          type: "DATE_SELECTED",
          date: dateKey
        });
      }
    },
    [
      locked,
      isPlanningConnected,
      currentUserExternalVisitsByDate,
      schedule,
      editingUserIds,
      planningStatesByDate,
      scope.user.id,
      deselectDate,
      selectDate,
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
