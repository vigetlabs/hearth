import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { Calendar } from "@/components/Calendar/Calendar";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import LockIcon from "@/components/icons/LockIcon";
import Loader from "@/components/Loader/Loader";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";

import type { Office } from "@/types/api/offices";
import type { WeekSchedule } from "@/types/calendar/calendar";

import { createAttendanceConfirmationObjectPayload } from "@/util/api/functions/attendanceConfirmations";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { useWeekAttendanceConfirmation } from "@/util/api/mutations/attendanceConfirmations/attendanceConfirmations";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import { useVisitsQuery } from "@/util/api/queries/visitQueries";
import { useAuth } from "@/util/auth/useAuth";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5;

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export default function CalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [focusedWeekStartDate, setFocusedWeekStartDate] = useState(() =>
    getWeekStartFromSearchParams(searchParams),
  );

  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);

  const officeIdParam = searchParams.get("office");

  const parsedOfficeId = officeIdParam ? Number(officeIdParam) : undefined;

  const activeOfficeId = Number.isFinite(parsedOfficeId)
    ? parsedOfficeId
    : user?.office_id;

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

  const currentEditingWeekId =
    activeOfficeId === undefined ? null : `${activeOfficeId}:${weekKey}`;

  const isEditingWeek =
    currentEditingWeekId !== null && editingWeekId === currentEditingWeekId;

  const officesQuery = useOfficesQuery();
  const offices = officesQuery.data ?? [];

  const defaultOffice =
    offices.find((option) => option.id === user?.office_id) ??
    offices[0] ??
    null;

  const office =
    offices.find((officeOption) => officeOption.id === activeOfficeId) ??
    defaultOffice;

  const officeRosterQuery = useOfficeRosterQuery(activeOfficeId ?? 1);

  const visitsQuery = useVisitsQuery({
    date: weekKey,
    view: "week",
    office_id: activeOfficeId ?? 1,
  });

  const attendanceConfirmationsQuery = useAttendanceConfirmationsQuery({
    officeId: activeOfficeId,
    startsOn: weekKey,
  });

  const confirmedUserIds = useMemo(() => {
    const attendanceConfirmations = attendanceConfirmationsQuery.data ?? [];

    return new Set(
      attendanceConfirmations.map((confirmation) => confirmation.user_id),
    );
  }, [attendanceConfirmationsQuery.data]);

  const isCurrentWeek = weekKey === currentWeekKey;

  const isWeekConfirmed = user !== undefined && confirmedUserIds.has(user.id);

  const isCalendarLocked = isWeekConfirmed && !isEditingWeek;

  const isRemote = office?.name.toLowerCase() === "remote";

  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
  } = useOfficePlanning({
    officeId: activeOfficeId ?? null,
    currentUserId: user?.id ?? null,
    dates: planningDateKeys,
  });

  const createAttendanceConfirmationMutation = useWeekAttendanceConfirmation();

  const schedule: WeekSchedule = useMemo(
    () =>
      buildWeekSchedule(
        officeRosterQuery.data ?? [],
        visitsQuery.data ?? [],
        weekDates,
        confirmedUserIds,
      ),
    [officeRosterQuery.data, visitsQuery.data, weekDates, confirmedUserIds],
  );

  const handlePlanningToggle = useCallback(
    (date: string, attending: boolean) => {
      if (attending) {
        selectDate(date);
        return;
      }

      deselectDate(date);
    },
    [selectDate, deselectDate],
  );

  function goPrevWeek(): void {
    changeFocusedWeek(addDays(focusedWeekStartDate, -7));
  }

  function goNextWeek(): void {
    changeFocusedWeek(addDays(focusedWeekStartDate, 7));
  }

  function goToday(): void {
    changeFocusedWeek(new Date());
  }

  function editWeek(): void {
    if (currentEditingWeekId === null) {
      return;
    }

    setEditingWeekId(currentEditingWeekId);
  }

  function confirmWeek(): void {
    if (!user || activeOfficeId === undefined) {
      return;
    }

    const selectedDates = weekDates
      .filter((date) => {
        const dateKey = toDateKey(date);
        const day = schedule[dateKey] ?? [];

        const currentUserStatus = day.find(
          (person) => person.userId === user.id,
        );

        const planningState = planningStatesByDate[dateKey];

        const explicitlySelected = planningState?.selected.some(
          (planningUser) => planningUser.id === user.id,
        );

        const explicitlyDeselected = planningState?.deselected.some(
          (planningUser) => planningUser.id === user.id,
        );

        if (explicitlySelected) {
          return true;
        }

        if (explicitlyDeselected) {
          return false;
        }

        return (
          currentUserStatus?.status === "planning-yes" ||
          currentUserStatus?.status === "confirmed-yes"
        );
      })
      .map(toDateKey);

    const payload = createAttendanceConfirmationObjectPayload({
      officeId: activeOfficeId,
      startsOn: weekKey,
      selectedDates,
    });

    createAttendanceConfirmationMutation.mutate(payload, {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: generateAttendanceConfirmationKey(
              activeOfficeId,
              weekKey,
            ),
          }),
          queryClient.invalidateQueries({
            queryKey: ["visits", weekKey, "week", activeOfficeId],
          }),
        ]);

        setEditingWeekId(null);
      },
    });
  }

  function changeOffice(nextOffice: Office): void {
    setEditingWeekId(null);

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.set("office", String(nextOffice.id));

      return nextParams;
    });
  }

  function changeFocusedWeek(nextWeekStart: Date): void {
    const normalizedWeekStart = startOfWeek(nextWeekStart);

    setEditingWeekId(null);
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
    visitsQuery.isPending ||
    attendanceConfirmationsQuery.isPending
  ) {
    return <Loader />;
  }

  if (
    officesQuery.isError ||
    officeRosterQuery.isError ||
    visitsQuery.isError ||
    attendanceConfirmationsQuery.isError
  ) {
    return <div>Unable to load calendar</div>;
  }

  if (!office || activeOfficeId === undefined) {
    return <div>No office is available</div>;
  }

  if (!user) {
    return <div>No user is available</div>;
  }

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
            <h2 className="flex items-center gap-2 text-2xl font-bold capitalize text-fg">
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
                {isEditingWeek ? (
                  <>
                    <span className="font-bold text-fg">Week Confirmed ✓</span>{" "}
                    Unlock Week to make changes.
                  </>
                ) : isWeekConfirmed ? (
                  <span className="font-bold text-fg">Confirmed.</span>
                ) : (
                  <>
                    <span className="font-bold text-fg">Planning.</span> Yet to
                    be confirmed
                  </>
                )}
              </p>

              {isWeekConfirmed && !isEditingWeek ? (
                <button
                  type="button"
                  onClick={editWeek}
                  className={unlockButton}
                >
                  <LockIcon className="h-3.5 w-3.5" />
                  Edit Week
                </button>
              ) : (
                <button
                  type="button"
                  onClick={confirmWeek}
                  disabled={
                    createAttendanceConfirmationMutation.isPending ||
                    !isPlanningConnected
                  }
                  className={confirmButton}
                >
                  {createAttendanceConfirmationMutation.isPending
                    ? "Confirming..."
                    : isEditingWeek
                      ? "Confirm Updated Week"
                      : "Confirm Week"}
                </button>
              )}
            </div>
          )}

          <Calendar
            schedule={schedule}
            office={office}
            days={weekDates}
            locked={isCalendarLocked}
            editingConfirmedWeek={isEditingWeek}
            user={user}
            planningByDate={planningStatesByDate}
            isPlanningConnected={isPlanningConnected}
            onPlanningToggle={handlePlanningToggle}
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
  "flex items-center gap-2 rounded-full bg-strong px-5 py-2 text-sm font-bold text-fg-inverse hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60";

const confirmButton = `ml-auto ${darkPillButton}`;

const unlockButton = `ml-auto ${darkPillButton}`;

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
