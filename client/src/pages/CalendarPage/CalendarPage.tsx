import { Calendar } from "@/components/Calendar/Calendar";
import { useAuth } from "@/util/auth/useAuth";
// import { userDisplayName } from "@/util/auth/displayName";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import { useVisitsQuery } from "@/util/api/queries/visitQueries";
// import { buildWeekSchedule, seedSelf } from "@/util/calendar/schedule";
import { startOfWeek, toDateKey } from "@/util/dates/date";
import type { Office } from "@/types/api/offices";
import { useSearchParams } from "react-router";
// import type { WeekSchedule } from "@/types/calendar/calendar";
// import { buildWeekSchedule } from "@/util/calendar/schedule";

// const WEEKDAYS_PER_WEEK = 5;

// function findActiveOffice(offices: Office[], activeOfficeId: string) {
//   offices.find((option) => option.id === activeOfficeId)
// }

export default function CalendarPage() {
  const { user } = useAuth();
  // const me = userDisplayName(user);
  const [searchParams, setSearchParams] = useSearchParams();

  const officeIdParam: string = searchParams.get("office");

  const activeOfficeId: number = officeIdParam
    ? Number(officeIdParam)
    : (user?.office_id ?? undefined);

  const visitsQuery = useVisitsQuery({
    date: toDateKey(startOfWeek(new Date())),
    view: "week",
    office_id: activeOfficeId,
  });

  const officesQuery = useOfficesQuery();
  const offices = officesQuery.data ?? [];

  const defaultOffice =
    offices.find((option) => option.id === user?.office_id) ??
    offices[0] ??
    null;

  const office: Office = getActiveOffice();

  // const weekStart = startOfWeek(new Date());
  // const weekDates = Array.from({ length: WEEKDAYS_PER_WEEK }, (_, i) =>
  //   addDays(weekStart, i),
  // );

  const officeRoster = useOfficeRosterQuery(activeOfficeId);
  console.log(officeRoster.data);

  if (!office || officeRoster.isPending || visitsQuery.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-sunken">
        <p className="text-lg text-fg-subtle">Loading calendar...</p>
      </div>
    );
  }

  if (officesQuery.isError || officeRoster.isError || visitsQuery.isError) {
    return (
      <div className="flex flex-1 items-center justify-center bg-surface-sunken">
        <p className="text-lg text-fg-subtle">
          Unable to load the calendar. Please try again.
        </p>
      </div>
    );
  }

  // const schedule: WeekSchedule = buildWeekSchedule(
  //   officeRosterQuery.data,
  //   visitsQuery.data,
  //   weekDates,
  //   activeOfficeId
  // )
  const schedule = {};

  function getActiveOffice() {
    return (
      offices.find((office) => office.id === activeOfficeId) ?? defaultOffice
    );
  }

  function changeOffice(nextOffice: Office) {
    setSearchParams({
      office: String(nextOffice.id),
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-sunken">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <Calendar
          schedule={schedule}
          office={office}
          setOffice={changeOffice}
          key={office.id}
        />
      </div>
    </div>
  );
}
