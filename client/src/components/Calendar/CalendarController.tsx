import { useMemo } from "react";

import type { CalendarData } from "@/hooks/useCalendarData";
import type { useOfficeAttending } from "@/util/cable/attendance/useOfficeAttending";
import type { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { getCapabilitiesFor } from "@/util/calendar/machineCapabilities";
import { useCalendarMachine } from "@/util/calendar/MachineProvider";
import { addDays, generateDateKey } from "@/util/dates/date";

import CalendarGrid from "./CalendarGrid";

const WEEKDAYS_PER_WEEK = 5;

interface CalendarControllerProps {
  data: CalendarData;
  planning: ReturnType<typeof useOfficePlanning>;
  attendanceEditing: ReturnType<
    typeof useOfficeAttending
  >;
}

export default function CalendarController({
  data,
  planning,
  attendanceEditing,
}: CalendarControllerProps) {
  const {
    user,
    offices,
    activeOffice,
    focusedWeekStart,
  } = useCalendarScope();

  const {
    state: machineState,
    dispatch: machineDispatch,
  } = useCalendarMachine();

  const capabilities =
    getCapabilitiesFor(machineState);

  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
  } = planning;

  const {
    editingUserIds,
  } = attendanceEditing;

  const weekDates = useMemo(
    () =>
      Array.from(
        { length: WEEKDAYS_PER_WEEK },
        (_, index) =>
          addDays(focusedWeekStart, index),
      ),
    [focusedWeekStart],
  );

  const confirmedUserIds = useMemo(
    () =>
      new Set(
        data.attendanceConfirmations.map(
          (confirmation) =>
            confirmation.user_id,
        ),
      ),
    [data.attendanceConfirmations],
  );

  const currentUserExternalVisitsByDate =
    useMemo(
      () =>
        new Map(
          data.currentUserVisits
            .filter(
              (visit) =>
                visit.office_id !==
                activeOffice.id,
            )
            .map((visit) => [
              visit.visit_date,
              visit,
            ]),
        ),
      [
        activeOffice.id,
        data.currentUserVisits,
      ],
    );

  const officesById = useMemo(
    () =>
      new Map(
        offices.map((office) => [
          office.id,
          office,
        ]),
      ),
    [offices],
  );

  const externalOfficeNamesByDate =
    useMemo(() => {
      const namesByDate =
        new Map<string, string>();

      for (const [
        dateKey,
        visit,
      ] of currentUserExternalVisitsByDate) {
        const office = officesById.get(
          visit.office_id,
        );

        if (office) {
          namesByDate.set(
            dateKey,
            office.name,
          );
        }
      }

      return namesByDate;
    }, [
      currentUserExternalVisitsByDate,
      officesById,
    ]);

  const externalOfficeEmojisByDate =
    useMemo(() => {
      const emojisByDate =
        new Map<string, string>();

      for (const [
        dateKey,
        visit,
      ] of currentUserExternalVisitsByDate) {
        const office = officesById.get(
          visit.office_id,
        );

        if (office) {
          emojisByDate.set(
            dateKey,
            office.emoji,
          );
        }
      }

      return emojisByDate;
    }, [
      currentUserExternalVisitsByDate,
      officesById,
    ]);

  const schedule = buildWeekSchedule(
    data.rosterUsers,
    data.visits,
    weekDates,
    confirmedUserIds,
    user.id,
    currentUserExternalVisitsByDate,
  );

  const rosterUserIds = useMemo(
    () =>
      new Set(
        data.rosterUsers.map(
          (rosterUser) => rosterUser.id,
        ),
      ),
    [data.rosterUsers],
  );

  const visitorCounts = weekDates.map(
    (date) => {
      const dateKey = generateDateKey(date);
      const rosterUsers =
        schedule[dateKey] ?? [];

      return rosterUsers.filter(
        (rosterUser) =>
          !rosterUserIds.has(
            rosterUser.userId,
          ),
      ).length;
    },
  );

  const highestVisitorCount = Math.max(
    0,
    ...visitorCounts,
  );

  const hotSpotDays = new Set(
    visitorCounts.flatMap(
      (visitorCount, index) =>
        visitorCount > 0 &&
        visitorCount === highestVisitorCount
          ? [index]
          : [],
    ),
  );

  function toggleDate(dateKey: string): void {
    if (
      !capabilities.canChangeDates ||
      !isPlanningConnected ||
      currentUserExternalVisitsByDate.has(
        dateKey,
      ) ||
      !("draftDates" in machineState)
    ) {
      return;
    }

    const isSelected =
      machineState.draftDates.has(dateKey);

    if (isSelected) {
      deselectDate(dateKey);

      machineDispatch({
        type: "DATE_DESELECTED",
        date: dateKey,
      });

      return;
    }

    selectDate(dateKey);

    machineDispatch({
      type: "DATE_SELECTED",
      date: dateKey,
    });
  }

  return (
    <CalendarGrid
      days={weekDates}
      attendance={schedule}
      office={activeOffice}
      user={user}
      visitorCounts={visitorCounts}
      hotSpotDays={hotSpotDays}
      locked={!capabilities.canChangeDates}
      onToggleDate={toggleDate}
      currentUserExternalVisitsByDate={
        currentUserExternalVisitsByDate
      }
      externalOfficeNamesByDate={
        externalOfficeNamesByDate
      }
      externalOfficeEmojisByDate={
        externalOfficeEmojisByDate
      }
    />
  );
}
