import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";

import { Calendar } from "@/components/Calendar/Calendar";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import Loader from "@/components/Loader/Loader";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";

import type { Office } from "@/types/api/offices";
import type { RosterUser, WeekSchedule } from "@/types/calendar/calendar";

import { createAttendanceConfirmationObjectPayload } from "@/util/api/functions/attendanceConfirmations";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { generateCurrentUserVisitsKey } from "@/util/api/keys/userKeys";
import { generateVisitsKey } from "@/util/api/keys/visitKeys";
import { useWeekAttendanceConfirmation } from "@/util/api/mutations/attendanceConfirmations/attendanceConfirmations";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useOfficesQuery } from "@/util/api/queries/officeQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import {
  useCurrentVisitsQuery,
  useVisitsQuery,
} from "@/util/api/queries/visitQueries";
import { useAuth } from "@/util/auth/useAuth";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import { addDays, startOfWeek, generateDateKey } from "@/util/dates/date";
import type { AttendanceConfirmation } from "@/types/api/attendanceConfirmations";
import type { User } from "@/types/api/users";
import type { Visit } from "@/types/api/visits";
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

// The logic is grouped into labelled sections below; a few pieces cross between them.
export default function CalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // === Initialization: resolve the office to display from the URL param (or the user's default) ===
  const [searchParams, setSearchParams] = useSearchParams();

  const officeIdParam: string | null = searchParams.get("office");
  const parsedOfficeId: number | undefined = officeIdParam
    ? Number(officeIdParam)
    : undefined;

  const officesQuery = useOfficesQuery();
  const offices: Office[] = useMemo(
    () => officesQuery.data ?? [],
    [officesQuery.data],
  );

  const requestedOfficeId: number | undefined = Number.isFinite(parsedOfficeId)
    ? parsedOfficeId
    : user?.office?.name.toLowerCase() === "remote"
      ? offices[0]?.id
      : user?.office?.id;

  const defaultOffice: Office | null = findCurrentUserOffice(offices, user);

  const officesById = useMemo(
    () => new Map(offices.map((office) => [office.id, office])),
    [offices],
  );

  const activeOffice: Office =
    findActiveOffice(offices, requestedOfficeId) ?? defaultOffice;

  /*
   * Derive the effective office id from the resolved office so it stays in sync
   * with what the calendar actually displays. Users without an assigned office
   * (office === null) fall back to the default office instead of leaking an
   * undefined office id into the API requests.
   */
  const activeOfficeId: number | undefined = activeOffice?.id;

  const officeRosterQuery = useOfficeRosterQuery(activeOfficeId ?? 1);

  // Whether the user's *default* office (not the one currently being viewed) is
  // remote. Remote-default users get a "Remote View" button above the calendar
  // that takes them to their remote portal.
  const isDefaultOfficeRemote = defaultOffice?.name.toLowerCase() === "remote";

  function changeOffice(nextOffice: Office): void {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.set("office", String(nextOffice.id));

      return nextParams;
    });
  }

  // === Dates: the focused week, its navigation, and the range label ===
  // Convention: date *keys* are `YYYY-MM-DD` strings; everything else is a `Date`.
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

  /* === VISITS LOGIC ===
   *
   * This logic handles the visit objects within the calendar page.
   */
  const officeVisitsQuery = useVisitsQuery({
    date: focusedWeekStartDateKey,
    view: "week",
    office_id: activeOfficeId ?? 1,
  });

  const currentUserVisitsQuery = useCurrentVisitsQuery({
    date: focusedWeekStartDateKey,
    view: "week",
  });

  const currentUserVisits: Visit[] = useMemo(
    () => currentUserVisitsQuery.data ?? [],
    [currentUserVisitsQuery.data],
  );

  const currentUserExternalVisitsByDate: Map<string, Visit> = useMemo(
    () =>
      new Map(
        currentUserVisits
          .filter((visit) => visit.office_id !== activeOfficeId)
          .map((visit) => [visit.visit_date, visit]),
      ),
    [currentUserVisits, activeOfficeId],
  );

  const externalOfficeNamesByDate = useMemo(
    () =>
      new Map(
        [...currentUserExternalVisitsByDate].map(([date, visit]) => [
          date,
          officesById.get(visit.office_id)?.name ?? "[NO NAME]",
        ]),
      ),
    [currentUserExternalVisitsByDate, officesById],
  );

  const externalOfficeEmojisByDate = useMemo(
    () =>
      new Map(
        [...currentUserExternalVisitsByDate].map(([date, visit]) => [
          date,
          officesById.get(visit.office_id)?.emoji ?? "",
        ]),
      ),
    [currentUserExternalVisitsByDate, officesById],
  );

  // The *other* offices (besides the one being viewed) the user is confirmed
  // at this week, each with the date keys they're confirmed there. External
  // visits are already confirmed records filtered to other offices, so we just
  // group them by office id. Offices are ordered by their earliest confirmed
  // day, and each office's days are sorted, so the rendered status reads in
  // chronological order.
  const externalOfficeSummaries: OtherOfficeSummary[] = useMemo(() => {
    const byOffice = new Map<number, OtherOfficeSummary>();

    for (const [dateKey, visit] of currentUserExternalVisitsByDate) {
      const existing = byOffice.get(visit.office_id);

      if (existing) {
        existing.dateKeys.push(dateKey);
        continue;
      }

      byOffice.set(visit.office_id, {
        id: visit.office_id,
        name: officesById.get(visit.office_id)?.name ?? "[NO NAME]",
        dateKeys: [dateKey],
      });
    }

    return [...byOffice.values()]
      .map((office) => ({ ...office, dateKeys: [...office.dateKeys].sort() }))
      .sort((a, b) => a.dateKeys[0].localeCompare(b.dateKeys[0]));
  }, [currentUserExternalVisitsByDate, officesById]);

  // === Attendance: confirmation state ===
  // A user's status resolves to one of: confirmed-yes, confirmed-no, planning-yes, planning-no.
  const attendanceConfirmationsQuery = useAttendanceConfirmationsQuery({
    officeId: activeOfficeId,
    startsOn: focusedWeekStartDateKey,
  });

  const confirmedUserIds = useConfirmedUserIds(
    attendanceConfirmationsQuery.data,
  );

  const isWeekConfirmed = user !== undefined && confirmedUserIds.has(user.id);

  const createAttendanceConfirmationMutation = useWeekAttendanceConfirmation();

  // Warn before confirming an in-office visit at a non-default office, so
  // visiting a non-home office is always a deliberate choice. The warning fires
  // only when the user is actually scheduling a day there, and only once per
  // office — tracked here so navigating between weeks doesn't re-prompt.
  const [isNonDefaultOfficeModalOpen, setIsNonDefaultOfficeModalOpen] =
    useState(false);
  const [officesWarnedForVisit, setOfficesWarnedForVisit] = useState<
    Set<number>
  >(() => new Set());

  // === Live updates: real-time planning + attendance over Rails Action Cable (Redis adapter) ===
  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
  } = useOfficePlanning({
    officeId: activeOfficeId ?? null,
    currentUserId: user?.id ?? null,
    dates: planningWeekDateKeys,
  });

  const {
    editingUserIds,
    startEditing,
    isConnected: isAttendanceConnected,
  } = useOfficeAttending({
    officeId: activeOfficeId ?? null,
    weekStart: focusedWeekStartDateKey,
    currentUserId: user?.id ?? null,
  });

  /*
   * Redis/Action Cable is the source of truth for editing state. This keeps
   * every tab and every connected calendar in the same mode for a user.
   */
  const isEditingWeek = user !== undefined && editingUserIds.has(user.id);

  const isCalendarLocked = isWeekConfirmed && !isEditingWeek;

  function editWeek(): void {
    if (
      user === undefined ||
      !isWeekConfirmed ||
      !isAttendanceConnected ||
      !isPlanningConnected
    ) {
      return;
    }

    startEditing();
  }

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
        user?.id,
        currentUserExternalVisitsByDate,
      ),
    [
      officeRosterQuery.data,
      officeVisitsQuery.data,
      weekDates,
      confirmedUserIds,
      user?.id,
      currentUserExternalVisitsByDate,
    ],
  );

  // The `YYYY-MM-DD` keys of the days the current user has chosen to attend this
  // office this week — derived from their roster status plus any live planning
  // toggles, and excluding days they're already confirmed at another office.
  // Shared by the confirm action and the non-default-office warning, which only
  // fires when this is non-empty (i.e. they're actually scheduling a visit).
  const selectedDates: string[] = useMemo(() => {
    if (!user) {
      return [];
    }

    return weekDates
      .filter((date: Date) => {
        const dateKey: string = generateDateKey(date);
        const rosterUsers: RosterUser[] = schedule[dateKey] ?? [];

        if (currentUserExternalVisitsByDate.has(dateKey)) {
          return false;
        }

        const curRosterUser = rosterUsers.find(
          (rosterUser) => rosterUser.userId === user.id,
        );

        const planningState: TogglePlanningOverrideState | undefined =
          planningStatesByDate[dateKey];

        const hasCurUserSelectedDate: boolean = isCurrentUserInPlanningState(
          planningState?.selected ?? [],
          user.id,
        );

        const hasCurUserDeselectedDate: boolean = isCurrentUserInPlanningState(
          planningState?.deselected ?? [],
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
  }, [
    user,
    weekDates,
    schedule,
    currentUserExternalVisitsByDate,
    planningStatesByDate,
  ]);

  function confirmWeek(): void {
    if (!user || activeOfficeId === undefined) {
      return;
    }

    const payload = createAttendanceConfirmationObjectPayload({
      officeId: activeOfficeId,
      startsOn: focusedWeekStartDateKey,
      selectedDates,
    });

    createAttendanceConfirmationMutation.mutate(payload, {
      onSuccess: async () => {
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
          queryClient.invalidateQueries({
            queryKey: generateCurrentUserVisitsKey(
              focusedWeekStartDateKey,
              "week",
            ),
          }),
        ]);
      },
    });
  }

  // Only warn when confirming an *in-office visit* at a non-default office —
  // and only the first time for that office. If the user isn't scheduling any
  // days (confirming "no"), or the default office, or we've already warned for
  // this office, confirm straight through with no modal.
  function handleConfirmWeekClick(): void {
    if (activeOfficeId === undefined) {
      return;
    }

    const isNonDefaultOffice =
      !defaultOffice || activeOfficeId !== defaultOffice.id;
    const isSchedulingVisit = selectedDates.length > 0;
    const alreadyWarned = officesWarnedForVisit.has(activeOfficeId);

    if (isNonDefaultOffice && isSchedulingVisit && !alreadyWarned) {
      setOfficesWarnedForVisit((prev) => new Set(prev).add(activeOfficeId));
      setIsNonDefaultOfficeModalOpen(true);
      return;
    }

    confirmWeek();
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
    <div className="relative flex flex-1 flex-col overflow-hidden bg-page">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_top_left,rgba(180,72,32,0.14),transparent),radial-gradient(60%_60%_at_right_82%,rgba(180,72,32,0.14),transparent)]"
      />

      <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
        {isDefaultOfficeRemote && (
          <Link
            to="/remote"
            className="mb-4 inline-flex self-start items-center gap-1.5 text-lg font-bold text-fg-subtle transition-colors hover:text-fg"
          >
            <span aria-hidden="true">‹</span> Remote View
          </Link>
        )}

        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 pb-5">
            <h2 className="flex items-center gap-2 text-2xl font-bold capitalize text-fg">
              {activeOffice.name}

              <span aria-hidden="true">{activeOffice.emoji}</span>
            </h2>

            <OfficeSwitcher office={activeOffice} setOffice={changeOffice} />
          </div>

          <div className="flex items-center gap-4 pb-5">
            <div className="flex items-center gap-1 rounded-full border-2 border-line bg-surface p-1">
              <button
                type="button"
                onClick={goPrevWeek}
                className={arrowButton}
                aria-label="Previous week"
              >
                <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" />
              </button>

              <span className="px-2 text-sm font-normal text-fg">
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

            <div className="h-4 w-0.5 bg-line" />

            <p className="text-sm text-fg">
              <span className="font-bold text-fg">
                {isCalendarLocked
                  ? externalOfficeSummaries.length >= 1
                    ? `Confirmed for ${capitalizeOfficeName(
                        activeOffice.name,
                      )} ✓`
                    : "Confirmed ✓"
                  : externalOfficeSummaries.length >= 1
                    ? `Planning for ${capitalizeOfficeName(activeOffice.name)}.`
                    : "Planning."}
              </span>{" "}
              {externalOfficeSummaries.length >= 1
                ? confirmedElsewhereText(externalOfficeSummaries)
                : isCalendarLocked
                  ? "Edit Week to make changes."
                  : "Select your days, then confirm."}
            </p>

            {isWeekConfirmed && !isEditingWeek ? (
              <button
                type="button"
                onClick={editWeek}
                disabled={!isAttendanceConnected || !isPlanningConnected}
                className={unlockButton}
              >
                Edit Week
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmWeekClick}
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

          <Calendar
            schedule={schedule}
            office={activeOffice}
            days={weekDates}
            locked={isCalendarLocked}
            user={user}
            planningByDate={planningStatesByDate}
            isPlanningConnected={isPlanningConnected}
            onPlanningToggle={handlePlanningToggle}
            currentUserExternalVisitsByDate={currentUserExternalVisitsByDate}
            externalOfficeNamesByDate={externalOfficeNamesByDate}
            editingUserIds={editingUserIds}
            externalOfficeEmojisByDate={externalOfficeEmojisByDate}
          />
        </div>
      </div>

      <ConfirmationModal
        open={isNonDefaultOfficeModalOpen}
        title={`Your default office is ${capitalizeOfficeName(
          defaultOffice?.name ?? "",
        )}`}
        description={`Are you sure you want to schedule an in-office visit to ${capitalizeOfficeName(
          activeOffice.name,
        )}?`}
        confirmLabel="Yes"
        cancelLabel="Go back"
        onConfirm={() => {
          setIsNonDefaultOfficeModalOpen(false);
          confirmWeek();
        }}
        onCancel={() => setIsNonDefaultOfficeModalOpen(false)}
      />
    </div>
  );
}

const arrowButton =
  "flex h-8 w-8 items-center justify-center text-fg-subtle transition-colors hover:text-fg";

const pillButton =
  "inline-flex h-11 items-center rounded-full border-2 border-line bg-surface px-5 text-sm text-fg transition-colors hover:bg-surface-sunken";

const todayButton = `${pillButton} font-bold`;

const darkPillButton =
  "flex h-11 items-center gap-2 rounded-full bg-strong px-5 text-sm font-bold text-fg-inverse transition-colors hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60";

const confirmButton = `ml-auto ${darkPillButton} bg-fill hover:bg-fill-hover`;

const unlockButton = `ml-auto ${darkPillButton} bg-[#6f281d]! hover:bg-fg!`;

/** One other office the user is confirmed at this week, with the `YYYY-MM-DD`
    keys of the days they're confirmed there (sorted ascending). */
interface OtherOfficeSummary {
  id: number;
  name: string;
  dateKeys: string[];
}

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

const officeListFormat = new Intl.ListFormat(undefined, {
  style: "long",
  type: "conjunction",
});

/** Parse a local `YYYY-MM-DD` key into a `Date` without timezone drift. */
function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Title-case an office name for display (e.g. "falls church" -> "Falls
    Church"), so status text reads consistently regardless of stored casing. */
function capitalizeOfficeName(name: string): string {
  return name.replace(/\b\w/g, (char) => char.toUpperCase());
}

/** A linked office name within the unbolded status note: colored, underlined,
    and pointing at that office's calendar so the user can jump straight there. */
function officeLink(office: OtherOfficeSummary): ReactNode {
  return (
    <Link
      key={office.id}
      to={`/calendar?office=${office.id}`}
      className="text-strong underline"
    >
      {capitalizeOfficeName(office.name)}
    </Link>
  );
}

/** The unbolded note following "Planning for [office].", describing the other
    offices the user is confirmed at this week. With a single other office it
    lists the specific days; with several it just names them. Each office name is
    a link to that office's calendar. Assumes at least one office (the caller
    only renders it when there is). */
function confirmedElsewhereText(offices: OtherOfficeSummary[]): ReactNode {
  if (offices.length === 1) {
    const office = offices[0];
    const days = office.dateKeys
      .map((key) => weekdayFormat.format(parseDateKey(key)))
      .join(", ");

    return (
      <>
        You&apos;re at {officeLink(office)} {days} 🔒
      </>
    );
  }

  // Interleave the linked office names with the list-format connectors ("," and
  // "and") so the styled links sit inside otherwise plain conjunction text.
  let elementIndex = 0;
  const nameNodes = officeListFormat
    .formatToParts(offices.map((office) => capitalizeOfficeName(office.name)))
    .map((part, i) =>
      part.type === "element" ? (
        officeLink(offices[elementIndex++])
      ) : (
        <span key={`sep-${i}`}>{part.value}</span>
      ),
    );

  return <>You&apos;re at {nameNodes} this week 🔒</>;
}

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
    offices.find((office) => office.id === currentUser.office?.id) ??
    offices[0] ??
    null
  );
}

function findActiveOffice(
  offices: Office[],
  activeOfficeId: number | undefined,
): Office | null {
  return offices.find((office) => office.id === activeOfficeId) ?? null;
}

function isCurrentUserInPlanningState(
  planningStateVariationUserList: ChannelSerializedUser[],
  userId: number,
): boolean {
  return planningStateVariationUserList.some(
    (planningUser) => planningUser.id === userId,
  );
}
