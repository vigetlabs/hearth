import { useMemo } from "react";
import { Link } from "react-router";

import type { CalendarData } from "@/hooks/useCalendarData";
import { useOfficeAttending } from "@/util/cable/attendance/useOfficeAttending";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { addDays, generateDateKey } from "@/util/dates/date";

import CalendarController from "./CalendarController";
import CalendarOfficeHeader from "./CalendarOfficeHeader";
import CalendarToolbar from "./CalendarToolbar";

const WEEKDAYS_PER_WEEK = 5;

interface CalendarWorkspaceProps {
  data: CalendarData;
}

export default function CalendarWorkspace({
  data,
}: CalendarWorkspaceProps) {
  const {
    user,
    offices,
    activeOffice,
    focusedWeekStart,
    focusedWeekStartKey,
  } = useCalendarScope();

  const planningWeekDateKeys = useMemo(
    () =>
      Array.from(
        { length: WEEKDAYS_PER_WEEK },
        (_, index) =>
          generateDateKey(
            addDays(focusedWeekStart, index),
          ),
      ),
    [focusedWeekStart],
  );

  const planning = useOfficePlanning({
    officeId: activeOffice.id,
    currentUserId: user.id,
    dates: planningWeekDateKeys,
  });

  const attendanceEditing = useOfficeAttending({
    officeId: activeOffice.id,
    weekStart: focusedWeekStartKey,
    currentUserId: user.id,
  });

  const defaultOffice = offices.find(
    (office) => office.id === user.office.id,
  );

  const isDefaultOfficeRemote =
    defaultOffice?.name.toLowerCase() === "remote";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isDefaultOfficeRemote && (
        <Link
          to="/remote"
          className="mb-4 inline-flex self-start items-center gap-1.5 text-lg font-bold text-fg-subtle transition-colors hover:text-fg"
        >
          <span aria-hidden="true">‹</span>
          Remote View
        </Link>
      )}

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-card">
        <CalendarOfficeHeader />

        <CalendarToolbar
          data={data}
          isPlanningConnected={planning.isConnected}
          isAttendanceConnected={
            attendanceEditing.isConnected
          }
        />

        <CalendarController
          data={data}
          planning={planning}
          attendanceEditing={attendanceEditing}
        />
      </section>
    </div>
  );
}
