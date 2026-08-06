import type { CalendarMachineEvent } from "@/types/calendar/machine/machineEvent";
import { machineStates, type CalendarMachineState } from "@/types/calendar/machine/machineState";
import { createAttendanceConfirmationObjectPayload } from "@/util/api/functions/attendanceConfirmations";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { generateCurrentUserVisitsKey } from "@/util/api/keys/userKeys";
import { generateVisitsKey } from "@/util/api/keys/visitKeys";
import { useWeekAttendanceConfirmation } from "@/util/api/mutations/attendanceConfirmations/attendanceConfirmations";
import { calendarEvents } from "@/util/calendar/machine/calendarEvents";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type Dispatch } from "react";
import { useCalendarRedisAttendingContext } from "../contexts/useCalendarRedisAttendingContext";
import { useCalendarScope } from "../contexts/useCalendarScopeContext";

interface UseCalendarMachineEffectsInput {
  state: CalendarMachineState;
  dispatch: Dispatch<CalendarMachineEvent>;
  activeOfficeId: number;
  focusedWeekStartKey: string;
}

export function useCalendarMachineEffects({
  state: machineState,
  dispatch,
  activeOfficeId,
  focusedWeekStartKey
}: UseCalendarMachineEffectsInput) {
  const scope = useCalendarScope();
  const queryClient = useQueryClient();
  const confirmWeekMutation = useWeekAttendanceConfirmation();

  const { startEditing } = useCalendarRedisAttendingContext();

  useEffect(() => {
    if (machineState.status !== machineStates.CONFIRMING) {
      return;
    }

    if (confirmWeekMutation.isPending) {
      return;
    }

    const payload = createAttendanceConfirmationObjectPayload({
      officeId: activeOfficeId,
      startsOn: focusedWeekStartKey,
      selectedDates: machineState.draftDates
    });

    confirmWeekMutation.mutate(payload, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: generateAttendanceConfirmationKey(
              activeOfficeId,
              focusedWeekStartKey
            )
          }),
          queryClient.invalidateQueries({
            queryKey: generateAttendanceConfirmationKey(
              scope.user.office.id,
              focusedWeekStartKey
            )
          }),
          queryClient.invalidateQueries({
            queryKey: generateVisitsKey({
              date: focusedWeekStartKey,
              view: "week",
              office_id: activeOfficeId
            })
          }),
          queryClient.invalidateQueries({
            queryKey: generateCurrentUserVisitsKey(
              focusedWeekStartKey,
              "week"
            )
          })
        ]);
        dispatch(calendarEvents.confirmWeekCompleted());
      },
      onError: () => {
        dispatch(calendarEvents.confirmWeekFailed());
      }
    });
  }, [
    machineState,
    activeOfficeId,
    focusedWeekStartKey,
    confirmWeekMutation.isPending,
    confirmWeekMutation,
    queryClient,
    dispatch
  ]);


  useEffect(() => {
    if (machineState.status !== machineStates.EDITING) {
      return;
    }

    try {
      startEditing();
      dispatch(calendarEvents.editWeekCompleted());
    } catch {
      dispatch(calendarEvents.editWeekFailed());
    }
  }, [
    machineState,
    startEditing,
    dispatch
  ]);
}
