import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { Calendar } from "@/components/Calendar/Calendar";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import LockIcon from "@/components/icons/LockIcon";
import Loader from "@/components/Loader/Loader";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";

import type { Office } from "@/types/api/offices";
import type { RosterUser, WeekSchedule } from "@/types/calendar/calendar";

import { createAttendanceConfirmationObjectPayload } from "@/util/api/functions/attendanceConfirmations";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { generateVisitsKey } from "@/util/api/keys/visitKeys";
import { useWeekAttendanceConfirmation } from "@/util/api/mutations/attendanceConfirmations/attendanceConfirmations";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import { useVisitsQuery } from "@/util/api/queries/visitQueries";
import { useAuth } from "@/util/auth/useAuth";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import { addDays, startOfWeek, generateDateKey } from "@/util/dates/date";
import type { AttendanceConfirmation } from "@/types/api/attendanceConfirmations";
import type { User } from "@/types/api/users";
import type {
  ChannelSerializedUser,
  TogglePlanningOverrideState,
} from "@/types/cable/officePlanning";
import { useOfficeAttending } from "@/util/cable/attendance/useOfficeAttending";

const WEEKDAYS_PER_WEEK = 5;

const rangeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

/*
 * Most of the variables are separated into a specific category for easier readability.
 * However, some of the logic crosses between categories.
 */
export default function CalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /* === GENERAL INITIALIZATION LOGIC ===
   *
   * This logic contains the general initialization logic that determines what the user sees
   * when the page is first rendered. The variables in this section is used to derive other states /
   * influence what is rendered
   */
  const [searchParams, setSearchParams] = useSearchParams();

  const officeIdParam: string = searchParams.get("office");
  const parsedOfficeId: number | null = officeIdParam
    ? Number(officeIdParam)
    : undefined;
  const activeOfficeId: number = Number.isFinite(parsedOfficeId)
    ? parsedOfficeId
    : user?.office_id;

  const officesQuery = useOfficesQuery();
  const offices: Office[] = officesQuery.data ?? [];
  const defaultOffice: Office | null = findCurrentUserOffice(offices, user);

  const activeOffice: Office =
    findActiveOffice(offices, activeOfficeId) ?? defaultOffice;

  const officeRosterQuery = useOfficeRosterQuery(activeOfficeId ?? 1);

  const isRemote = activeOffice?.name.toLowerCase() === "remote";

  function changeOffice(nextOffice: Office): void {
    setEditingWeekId(null);

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.set("office", String(nextOffice.id));

      return nextParams;
    });
  }

  /* === DATE LOGIC ===
   *
   * This logic determines how the dates are handled in the calendar, such as jumping to today,
   * viewing the next or previous week, and determining what the beginning date of the week is.
   *
   * Date keys typically operate operate in strings, otherwise, date related variables typically are
   * in the type of `Date`.
   */

  const [focusedWeekStartDate, setFocusedWeekStartDate] = useState<Date>(() =>
    getWeekStartFromSearchParams(searchParams),
  );
  const focusedWeekStartDateKey: string = generateDateKey(focusedWeekStartDate);

  const weekDates: Date[] = useMemo(
    () => generateWeekDates(focusedWeekStartDate, WEEKDAYS_PER_WEEK),
    [focusedWeekStartDate],
  );

  const planningWeekDateKeys: string[] = useMemo(
    () => weekDates.map(generateDateKey),
    [weekDates],
  );

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

  function goPrevWeek(): void {
    changeFocusedWeek(addDays(focusedWeekStartDate, -7));
  }

  function goNextWeek(): void {
    changeFocusedWeek(addDays(focusedWeekStartDate, 7));
  }

  function goToday(): void {
    changeFocusedWeek(new Date());
  }

  const rangeLabel = `${rangeFormat.format(
    weekDates[0],
  )} - ${rangeFormat.format(
    weekDates[WEEKDAYS_PER_WEEK - 1],
  )}, ${weekDates[WEEKDAYS_PER_WEEK - 1].getFullYear()}`;

  const currentStartingWeekKey: string = generateDateKey(
    startOfWeek(new Date()),
  );

  const isCurrentWeek = focusedWeekStartDateKey === currentStartingWeekKey;

  /* === EDITING WEEK LOGIC ===
   *
   * This logic handles when a calendar should be locked for a user. Calendar becomes locked when
   * a user "confirms" their week or when there is an existing `AttendanceConfirmation` record
   * in the currently viewing date range and office
   */
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
  const currentEditingWeekId: string | null =
    activeOfficeId === undefined
      ? null
      : generateEditingWeekId(activeOfficeId, focusedWeekStartDateKey);

  const isEditingWeek =
    currentEditingWeekId !== null && editingWeekId === currentEditingWeekId;

  function editWeek(): void {
    if (currentEditingWeekId === null) {
      return;
    }

    setEditingWeekId(currentEditingWeekId);
  }

  /* === VISITS LOGIC ===
   *
   * This logic handles the visit objects within the calendar page.
   */
  const officeVisitsQuery = useVisitsQuery({
    date: focusedWeekStartDateKey,
    view: "week",
    office_id: activeOfficeId ?? 1,
  });

  /* === ATTENDANCE LOGIC ===
   *
   * This logic handles the attendance statuses within the calendar page. These are the following possible
   * states that a user can be categorized in: `confirmed-yes`, `confirmed-no`, `planning-yes`, and
   * `planning-no`.
   */
  const attendanceConfirmationsQuery = useAttendanceConfirmationsQuery({
    officeId: activeOfficeId,
    startsOn: focusedWeekStartDateKey,
  });

  const confirmedUserIds = useConfirmedUserIds(
    attendanceConfirmationsQuery.data,
  );

  const isWeekConfirmed = user !== undefined && confirmedUserIds.has(user.id);

  const isCalendarLocked = isWeekConfirmed && !isEditingWeek;

  const createAttendanceConfirmationMutation = useWeekAttendanceConfirmation();

  /*
   * === ACTION CABLE CHANNEL LOGIC ===
   *
   * This logic handles the the live functionality of the calendar that comes from Rails Action Cable
   * and Redis adapter
   */
  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
    clearDates,
  } = useOfficePlanning({
    officeId: activeOfficeId ?? null,
    currentUserId: user?.id ?? null,
    dates: planningWeekDateKeys,
  });

  const { isConnected: isAttendingConnected } = useOfficeAttending({
    officeId: activeOfficeId ?? null,
  });

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

  const schedule: WeekSchedule = useMemo(
    () =>
      buildWeekSchedule(
        officeRosterQuery.data ?? [],
        officeVisitsQuery.data ?? [],
        weekDates,
        confirmedUserIds,
      ),
    [
      officeRosterQuery.data,
      officeVisitsQuery.data,
      weekDates,
      confirmedUserIds,
    ],
  );

  function confirmWeek(): void {
    if (!user || activeOfficeId === undefined) {
      return;
    }

    const selectedDates: string[] = weekDates
      .filter((date: Date) => {
        const dateKey: string = generateDateKey(date);
        const rosterUsers: RosterUser[] = schedule[dateKey] ?? [];

        const curRosterUser = rosterUsers.find(
          (rosterUser) => rosterUser.userId === user.id,
        );

        const planningState: TogglePlanningOverrideState =
          planningStatesByDate[dateKey];

        const hasCurUserSelectedDate: boolean = isCurrentUserInPlanningState(
          planningState.selected,
          user.id,
        );

        const hasCurUserDeselectedDate: boolean = isCurrentUserInPlanningState(
          planningState.deselected,
          user.id,
        );

        if (hasCurUserSelectedDate) {
          return true;
        }

        if (hasCurUserDeselectedDate) {
          return false;
        }

        return (
          curRosterUser?.status === "planning-yes" ||
          curRosterUser?.status === "confirmed-yes"
        );
      })
      .map(generateDateKey);

    const payload = createAttendanceConfirmationObjectPayload({
      officeId: activeOfficeId,
      startsOn: focusedWeekStartDateKey,
      selectedDates,
    });

    createAttendanceConfirmationMutation.mutate(payload, {
      onSuccess: async () => {
        clearDates(planningWeekDateKeys);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: generateAttendanceConfirmationKey(
              activeOfficeId,
              focusedWeekStartDateKey,
            ),
          }),
          queryClient.invalidateQueries({
            queryKey: generateVisitsKey({
              date: focusedWeekStartDateKey,
              view: "week",
              office_id: activeOfficeId,
            }),
          }),
        ]);

        setEditingWeekId(null);
      },
    });
  }

  if (
    officesQuery.isPending ||
    officeRosterQuery.isPending ||
    officeVisitsQuery.isPending ||
    attendanceConfirmationsQuery.isPending
  ) {
    return <Loader />;
  }

  if (
    officesQuery.isError ||
    officeRosterQuery.isError ||
    officeVisitsQuery.isError ||
    attendanceConfirmationsQuery.isError
  ) {
    return <div>Unable to load calendar</div>;
  }

  if (!activeOffice || activeOfficeId === undefined) {
    return <div>No office is available</div>;
  }

  if (!user) {
    return <div>No user is available</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-page">
      <div className="mx-auto flex min-h-0 w-[90%] flex-1 flex-col py-8">
        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-[0px_11.42px_34.26px_0px_#0000000F]">
          <div className="flex items-center gap-3 pb-5">
            <h2 className="flex items-center gap-2 text-2xl font-bold capitalize text-fg">
              {activeOffice.name}

              <span aria-hidden="true">{activeOffice.emoji}</span>
            </h2>

            <OfficeSwitcher office={activeOffice} setOffice={changeOffice} />
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
                    : "Confirm Week"}
                </button>
              )}
            </div>
          )}

          <Calendar
            schedule={schedule}
            office={activeOffice}
            days={weekDates}
            locked={isCalendarLocked}
            editingConfirmedWeek={isEditingWeek}
            user={user}
            planningByDate={planningStatesByDate}
            isPlanningConnected={isPlanningConnected}
            isAttendingConnected={isAttendingConnected}
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

function generateEditingWeekId(
  activeOfficeId: number,
  focusedWeekStartDateKey: string,
): string {
  return `${activeOfficeId}:${focusedWeekStartDateKey}`;
}

function useConfirmedUserIds(
  confirmations: AttendanceConfirmation[] | undefined,
): Set<number> {
  return useMemo(
    () =>
      new Set(
        (confirmations ?? []).map((confirmation) => confirmation.user_id),
      ),
    [confirmations],
  );
}

function generateWeekDates(weekStartDate: Date, numberOfDays = 5): Date[] {
  return Array.from({ length: numberOfDays }, (_, index) =>
    addDays(weekStartDate, index),
  );
}

function findCurrentUserOffice(
  offices: Office[],
  currentUser: User,
): Office | null {
  return (
    offices.find((office) => office.id === currentUser.office_id) ??
    offices[0] ??
    null
  );
}

function findActiveOffice(
  offices: Office[],
  activeOfficeId: number,
): Office | null {
  return offices.find((office) => office.id === activeOfficeId);
}

function isCurrentUserInPlanningState(
  planningStateVariationUserList: ChannelSerializedUser[],
  userId: number,
): boolean {
  return planningStateVariationUserList.some(
    (planningUser) => planningUser.id === userId,
  );
}
