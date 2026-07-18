import { Calendar } from "@/components/Calendar/Calendar";
import { useAuth } from "@/util/auth/useAuth";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import { useVisitsQuery } from "@/util/api/queries/visitQueries";
import PencilIcon from "@/components/icons/PencilIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";
import { useSearchParams } from "react-router";
import type { WeekSchedule } from "@/types/calendar/calendar";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import Loader from "@/components/Loader/Loader";
import { useMemo, useState } from "react";
import type { Office } from "@/types/api/offices";
import { useOfficePlanning } from "@/util/cable/useOfficePlanning";

const WEEKDAYS_PER_WEEK = 5;

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function getWeekStartFromSearchParams(searchParams: URLSearchParams): Date {
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return startOfWeek(new Date());
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return startOfWeek(new Date());
  }

  const parsedDate = new Date(year, month - 1, day);

  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  if (!isValidDate) {
    return startOfWeek(new Date());
  }

  return startOfWeek(parsedDate);
}

function setDateSearchParams(params: URLSearchParams, date: Date): void {
  params.set("year", String(date.getFullYear()));
  params.set("month", String(date.getMonth() + 1));
  params.set("day", String(date.getDate()));
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [focusedWeekStartDate, setFocusedWeekStartDate] = useState(() =>
    getWeekStartFromSearchParams(searchParams),
  );

  const [confirmedWeeks, setConfirmedWeeks] = useState<Set<string>>(
    () => new Set(),
  );

  const officeIdParam = searchParams.get("office");

  const parsedOfficeId = officeIdParam ? Number(officeIdParam) : undefined;

  const activeOfficeId = Number.isFinite(parsedOfficeId)
    ? parsedOfficeId
    : user?.office_id;

  const officesQuery = useOfficesQuery();
  const offices = officesQuery.data ?? [];

  const defaultOffice =
    offices.find((option) => option.id === user?.office_id) ??
    offices[0] ??
    null;

  const office =
    offices.find((office) => office.id === activeOfficeId) ?? defaultOffice;

  const officeRosterQuery = useOfficeRosterQuery(activeOfficeId ?? 1);

  const visitsQuery = useVisitsQuery({
    date: toDateKey(focusedWeekStartDate),
    view: "week",
    office_id: activeOfficeId ?? 1,
  });

  const weekDates = useMemo(
    () =>
      Array.from({ length: WEEKDAYS_PER_WEEK }, (_, index) =>
        addDays(focusedWeekStartDate, index),
      ),
    [focusedWeekStartDate],
  );

  const planningDateKeys = useMemo(() => weekDates.map(toDateKey), [weekDates]);

  const weekKey = toDateKey(focusedWeekStartDate);
  const currentWeekKey = toDateKey(startOfWeek(new Date()));

  const isCurrentWeek = weekKey === currentWeekKey;
  const isWeekConfirmed = confirmedWeeks.has(weekKey);
  const isRemote = office?.name.toLowerCase() === "remote";

  const {
    planningByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
    // refreshSnapshot
  } = useOfficePlanning({
    officeId: activeOfficeId ?? null,
    currentUserId: user?.id ?? null,
    dates: planningDateKeys,
  });

  function togglePlanningDate(date: string): void {
    if (!user || !isPlanningConnected || isWeekConfirmed) {
      return;
    }

    const usersForDate = planningByDate[date] ?? [];

    const currentUserIsPlanning = usersForDate.some(
      (planningUser) => planningUser.id === user.id,
    );

    if (currentUserIsPlanning) {
      deselectDate(date);
    } else {
      selectDate(date);
    }
  }

  function goPrevWeek(): void {
    changeFocusedWeek(addDays(focusedWeekStartDate, -7));
  }

  function goNextWeek(): void {
    changeFocusedWeek(addDays(focusedWeekStartDate, 7));
  }

  function goToday(): void {
    changeFocusedWeek(new Date());
  }

  function confirmWeek(): void {
    setConfirmedWeeks((current) => {
      const next = new Set(current);
      next.add(weekKey);
      return next;
    });
    // @TODO: Should call mutation to change user's selected visits to "confirmed" status in DB
  }

  function editWeek(): void {
    setConfirmedWeeks((current) => {
      const next = new Set(current);
      next.delete(weekKey);
      return next;
    });
    // @TODO: Should call mutation to change user's selected visits to "planned" status in DB
  }

  function changeOffice(nextOffice: Office): void {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("office", String(nextOffice.id));
      return nextParams;
    });
  }

  function changeFocusedWeek(nextWeekStart: Date): void {
    const normalizedWeekStart = startOfWeek(nextWeekStart);

    setFocusedWeekStartDate(normalizedWeekStart);

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      setDateSearchParams(nextParams, normalizedWeekStart);

      return nextParams;
    });
  }

  if (
    officesQuery.isPending ||
    officeRosterQuery.isPending ||
    visitsQuery.isPending
  ) {
    return <Loader />;
  }

  if (
    officesQuery.isError ||
    officeRosterQuery.isError ||
    visitsQuery.isError
  ) {
    return <div>Unable to load calendar</div>;
  }

  if (!office || activeOfficeId === undefined) {
    return <div>No office is available</div>;
  }

  if (!user) {
    return <div>No user is available</div>;
  }

  const schedule: WeekSchedule = buildWeekSchedule(
    officeRosterQuery.data ?? [],
    visitsQuery.data ?? [],
    weekDates,
  );
  console.log(schedule);

  const rangeLabel = `${rangeFormat.format(
    weekDates[0],
  )} - ${rangeFormat.format(
    weekDates[WEEKDAYS_PER_WEEK - 1],
  )}, ${weekDates[WEEKDAYS_PER_WEEK - 1].getFullYear()}`;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-page">
      <div className="mx-auto flex min-h-0 w-[90%] flex-1 flex-col py-8">
        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-[0px_11.42px_34.26px_0px_#0000000F]">
          <div className="flex items-center gap-3 pb-5">
            <h2 className="flex items-center gap-2 text-2xl capitalize font-bold text-fg">
              {office.name}
              <span aria-hidden="true">{office.emoji}</span>
            </h2>

            <OfficeSwitcher office={office} setOffice={changeOffice} />
          </div>

          {!isRemote && (
            <div className="flex items-center gap-4 pb-5">
              <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
                <button
                  type="button"
                  onClick={goPrevWeek}
                  className={arrowButton}
                  aria-label="Previous week"
                >
                  <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" />
                </button>

                <span className="px-2 text-sm font-bold text-fg">
                  {rangeLabel}
                </span>

                <button
                  type="button"
                  onClick={goNextWeek}
                  className={arrowButton}
                  aria-label="Next week"
                >
                  <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90" />
                </button>
              </div>

              {!isCurrentWeek && (
                <button type="button" onClick={goToday} className={todayButton}>
                  Jump to today
                </button>
              )}

              <div className="h-6 w-px bg-line" />

              <p className="text-sm text-fg-subtle">
                {isWeekConfirmed ? (
                  <>
                    <span className="font-bold text-fg">Week Confirmed ✓</span>{" "}
                    Unlock Week to make changes.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-fg">Planning.</span> Yet to
                    be confirmed
                  </>
                )}
              </p>

              {isWeekConfirmed ? (
                <button type="button" onClick={editWeek} className={editButton}>
                  Edit Week
                  <PencilIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={confirmWeek}
                  className={confirmButton}
                >
                  Confirm Week
                </button>
              )}
            </div>
          )}

          <Calendar
            schedule={schedule}
            office={office}
            days={weekDates}
            locked={isWeekConfirmed}
            user={user}
            planningByDate={planningByDate}
            isPlanningConnected={isPlanningConnected}
            onPlanningToggle={togglePlanningDate}
          />
        </div>
      </div>
    </div>
  );
}

const arrowButton =
  "flex h-8 w-8 items-center justify-center text-fg-strong hover:text-fg";

const pillButton =
  "rounded-full border border-line bg-surface px-5 py-2 text-sm text-fg hover:bg-surface-sunken";

const todayButton = `${pillButton} font-semibold`;

const darkPillButton =
  "flex items-center gap-2 rounded-full bg-strong px-5 py-2 text-sm font-bold text-fg-inverse hover:bg-strong-hover";

const confirmButton = `ml-auto ${darkPillButton}`;

const editButton = `ml-auto ${darkPillButton}`;
