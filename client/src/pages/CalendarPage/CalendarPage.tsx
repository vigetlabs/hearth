import { useState } from "react";

import { Calendar } from "@/components/Calendar/Calendar";
import { useAuth } from "@/util/auth/useAuth";
// import { userDisplayName } from "@/util/auth/displayName";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useRosterQuery } from "@/util/api/queries/userQueries";
import { useVisitsQuery } from "@/util/api/queries/visitQueries";
// import { buildWeekSchedule, seedSelf } from "@/util/calendar/schedule";
import { startOfWeek, toDateKey } from "@/util/dates/date";
import type { Office } from "@/types/api/offices";

// const WEEKDAYS_PER_WEEK = 5;
const VIEW = "week";

export default function CalendarPage() {
  const { user } = useAuth();
  // const me = userDisplayName(user);

  const weekStart = startOfWeek(new Date());
  // const weekDates = Array.from({ length: WEEKDAYS_PER_WEEK }, (_, i) =>
  //   addDays(weekStart, i),
  // );

  console.log("Date: ", weekStart.toISOString().split("T")[0]);

  const officesQuery = useOfficesQuery();
  const rosterQuery = useRosterQuery();
  const visitsQuery = useVisitsQuery({
    date: toDateKey(weekStart),
    view: VIEW,
  });

  console.log("Data: ", visitsQuery.data);

  // The office the user has explicitly switched to. Null means "follow the
  // default" — the user's home office, falling back to the first office the API
  // returns. Held in component state only; resets on a full page load.
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);

  const offices = officesQuery.data ?? [];
  const defaultOffice =
    offices.find((option) => option.id === user?.office_id) ??
    offices[0] ??
    null;
  const office =
    offices.find((option) => option.id === selectedOfficeId) ?? defaultOffice;

  const setOffice = (next: Office) => setSelectedOfficeId(next.id);

  if (!office || rosterQuery.isPending || visitsQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-sunken">
        <p className="text-lg text-fg-subtle">Loading calendar...</p>
      </div>
    );
  }

  if (officesQuery.isError || rosterQuery.isError || visitsQuery.isError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-sunken">
        <p className="text-lg text-fg-subtle">
          Unable to load the calendar. Please try again.
        </p>
      </div>
    );
  }

  // const schedule = seedSelf(
  //   buildWeekSchedule(rosterQuery.data, visitsQuery.data, weekDates, office.id),
  //   me,
  //   weekDates,
  // );
  const schedule = {};

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-sunken">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <Calendar
          schedule={schedule}
          office={office}
          setOffice={setOffice}
          key={office.id}
        />
      </div>
    </div>
  );
}
