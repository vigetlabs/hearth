import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

import { Calendar } from "@/components/Calendar/Calendar";
import DateController from "@/components/Calendar/DateController";
import CalendarTour from "@/components/CalendarTour/CalendarTour";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import PencilIcon from "@/components/icons/PencilIcon";
import OfficeSwitcher from "@/components/OfficeSwitcher/OfficeSwitcher";
import type { AttendanceConfirmation } from "@/types/api/attendanceConfirmations";
import type { WeekSchedule } from "@/types/calendar/calendar";
import type { CalendarMachineBootstrap } from "@/types/calendar/machineEvent";

import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";
import { createAttendanceConfirmationObjectPayload } from "@/util/api/functions/attendanceConfirmations";
import { generateAttendanceConfirmationKey } from "@/util/api/keys/attendanceConfirmationsKeys";
import { generateCurrentUserVisitsKey } from "@/util/api/keys/userKeys";
import { generateVisitsKey } from "@/util/api/keys/visitKeys";
import { useWeekAttendanceConfirmation } from "@/util/api/mutations/attendanceConfirmations/attendanceConfirmations";
import { useAttendanceConfirmationsQuery } from "@/util/api/queries/attendanceConfirmationQueries";
import { useOfficeRosterQuery } from "@/util/api/queries/userQueries";
import {
  useCurrentVisitsQuery,
  useVisitsQuery,
} from "@/util/api/queries/visitQueries";
import { useOfficeAttending } from "@/util/cable/attendance/useOfficeAttending";
import { useOfficePlanning } from "@/util/cable/planning/useOfficePlanning";
import { buildSelectedDatesBootstrap } from "@/util/calendar/dates";
import { CalendarMachineProvider } from "@/util/calendar/MachineProvider";
import { buildWeekSchedule } from "@/util/calendar/schedule";
import { generateDateKey, startOfWeek } from "@/util/dates/date";

import type { ResolvedOfficeSelection, WeekSelection } from "@/types/calendar/hooks";
import type { User } from "@/types/api/users";

interface CalendarPageContentProps {
  officeSelection: ResolvedOfficeSelection;
  weekSelection: WeekSelection;
  user: User
}

export default function CalendarPageContent({
  user,
  officeSelection,
  weekSelection,
}: CalendarPageContentProps) {
  const queryClient = useQueryClient();

  const {
    activeOffice,
    defaultOffice,
    offices,
    changeOffice,
  } = officeSelection;

  const {
    weekStart,
    weekStartKey,
    weekDates,
    changeWeek,
  } = weekSelection;

  const officeId = activeOffice.id;
  const currentWeekStartKey = generateDateKey(
    startOfWeek(new Date()),
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

  const planningWeekDateKeys = useMemo(
    () => weekDates.map(generateDateKey),
    [weekDates],
  );

  const officeRosterQuery =
    useOfficeRosterQuery(officeId);

  const officeVisitsQuery = useVisitsQuery({
    date: weekStartKey,
    view: "week",
    office_id: officeId,
  });

  const currentUserVisitsQuery =
    useCurrentVisitsQuery({
      date: weekStartKey,
      view: "week",
    });

  const attendanceConfirmationsQuery =
    useAttendanceConfirmationsQuery({
      officeId,
      startsOn: weekStartKey,
    });

  const {
    planningStatesByDate,
    isConnected: isPlanningConnected,
    selectDate,
    deselectDate,
  } = useOfficePlanning({
    officeId,
    currentUserId: user.id,
    dates: planningWeekDateKeys,
  });

  const {
    editingUserIds,
    startEditing,
    isConnected: isAttendanceConnected,
  } = useOfficeAttending({
    officeId,
    weekStart: weekStartKey,
    currentUserId: user.id,
  });

  const createAttendanceConfirmationMutation =
    useWeekAttendanceConfirmation();

  const [isNonDefaultOfficeModalOpen, setIsNonDefaultOfficeModalOpen] =
    useState(false);

  const [officesWarnedForVisit, setOfficesWarnedForVisit] =
    useState<Set<number>>(() => new Set());

  const currentUserVisits =
    currentUserVisitsQuery.data ?? [];

  const currentUserExternalVisitsByDate = useMemo(
    () =>
      new Map(
        currentUserVisits
          .filter(
            (visit) =>
              visit.office_id !== officeId,
          )
          .map((visit) => [
            visit.visit_date,
            visit,
          ]),
      ),
    [currentUserVisits, officeId],
  );

  const externalOfficeNamesByDate = useMemo(
    () =>
      new Map(
        [...currentUserExternalVisitsByDate].map(
          ([date, visit]) => [
            date,
            officesById.get(visit.office_id)?.name ??
              "[NO NAME]",
          ],
        ),
      ),
    [
      currentUserExternalVisitsByDate,
      officesById,
    ],
  );

  const externalOfficeEmojisByDate = useMemo(
    () =>
      new Map(
        [...currentUserExternalVisitsByDate].map(
          ([date, visit]) => [
            date,
            officesById.get(visit.office_id)?.emoji ??
              "",
          ],
        ),
      ),
    [
      currentUserExternalVisitsByDate,
      officesById,
    ],
  );

  const externalOfficeSummaries =
    useMemo<OtherOfficeSummary[]>(() => {
      const byOffice =
        new Map<number, OtherOfficeSummary>();

      for (
        const [dateKey, visit]
        of currentUserExternalVisitsByDate
      ) {
        const existing =
          byOffice.get(visit.office_id);

        if (existing) {
          existing.dateKeys.push(dateKey);
          continue;
        }

        byOffice.set(visit.office_id, {
          id: visit.office_id,
          name:
            officesById.get(visit.office_id)?.name ??
            "[NO NAME]",
          dateKeys: [dateKey],
        });
      }

      return [...byOffice.values()]
        .map((office) => ({
          ...office,
          dateKeys: [...office.dateKeys].sort(),
        }))
        .sort((a, b) =>
          a.dateKeys[0].localeCompare(
            b.dateKeys[0],
          ),
        );
    }, [
      currentUserExternalVisitsByDate,
      officesById,
    ]);

  const confirmedUserIds = useConfirmedUserIds(
    attendanceConfirmationsQuery.data,
  );

  const isWeekConfirmed =
    confirmedUserIds.has(user.id);

  const isEditingWeek =
    editingUserIds.has(user.id);

  const isCalendarLocked =
    isWeekConfirmed && !isEditingWeek;

  const schedule: WeekSchedule = useMemo(
    () =>
      buildWeekSchedule(
        officeRosterQuery.data ?? [],
        officeVisitsQuery.data ?? [],
        weekDates,
        confirmedUserIds,
        user.id,
        currentUserExternalVisitsByDate,
      ),
    [
      officeRosterQuery.data,
      officeVisitsQuery.data,
      weekDates,
      confirmedUserIds,
      user.id,
      currentUserExternalVisitsByDate,
    ],
  );

  const bootstrapSelectedDates = useMemo(
    () =>
      buildSelectedDatesBootstrap({
        userId: user.id,
        weekDates,
        schedule,
        planningStatesByDate,
        externalVisitsByDate:
          currentUserExternalVisitsByDate,
      }),
    [
      user.id,
      weekDates,
      schedule,
      planningStatesByDate,
      currentUserExternalVisitsByDate,
    ],
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

  function editWeek(): void {
    if (
      !isWeekConfirmed ||
      !isAttendanceConnected ||
      !isPlanningConnected
    ) {
      return;
    }

    startEditing();
  }

  function confirmWeek(): void {
    const payload =
      createAttendanceConfirmationObjectPayload({
        officeId,
        startsOn: weekStartKey,
        selectedDates: bootstrapSelectedDates,
      });

    createAttendanceConfirmationMutation.mutate(
      payload,
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey:
                generateAttendanceConfirmationKey(
                  officeId,
                  weekStartKey,
                ),
            }),
            queryClient.invalidateQueries({
              queryKey: generateVisitsKey({
                date: weekStartKey,
                view: "week",
                office_id: officeId,
              }),
            }),
            queryClient.invalidateQueries({
              queryKey:
                generateCurrentUserVisitsKey(
                  weekStartKey,
                  "week",
                ),
            }),
          ]);
        },
      },
    );
  }

  function handleConfirmWeekClick(): void {
    const isNonDefaultOffice =
      !defaultOffice ||
      officeId !== defaultOffice.id;

    const isSchedulingVisit =
      bootstrapSelectedDates.length > 0;

    const alreadyWarned =
      officesWarnedForVisit.has(officeId);

    if (
      isNonDefaultOffice &&
      isSchedulingVisit &&
      !alreadyWarned
    ) {
      setOfficesWarnedForVisit(
        (previousOfficeIds) =>
          new Set(previousOfficeIds).add(
            officeId,
          ),
      );

      setIsNonDefaultOfficeModalOpen(true);
      return;
    }

    confirmWeek();
  }

  const isLoading =
    officeRosterQuery.isLoading ||
    officeVisitsQuery.isLoading ||
    currentUserVisitsQuery.isLoading ||
    attendanceConfirmationsQuery.isLoading;

  if (isLoading) {
    return <CalendarPageSkeleton />;
  }

  const isError =
    officeRosterQuery.isError ||
    officeVisitsQuery.isError ||
    currentUserVisitsQuery.isError ||
    attendanceConfirmationsQuery.isError;

  if (isError) {
    return <div>Unable to load calendar</div>;
  }

  const machineBootstrap:
    CalendarMachineBootstrap = {
    scope: {
      officeId,
      weekStart: weekStartKey,
    },
    confirmed: isWeekConfirmed,
    selectedDates: bootstrapSelectedDates,
  };

  const isDefaultOfficeRemote =
    defaultOffice?.name.toLowerCase() ===
    "remote";

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-page">
      <CalendarMachineProvider
        key={`${officeId}:${weekStartKey}`}
        bootstrap={machineBootstrap}
      >
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
              <span aria-hidden="true">‹</span>
              Remote View
            </Link>
          )}

          <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3 pb-5">
              <h2 className="flex items-center gap-2 text-2xl font-bold capitalize text-fg">
                {activeOffice.name}

                <span aria-hidden="true">
                  {activeOffice.emoji}
                </span>
              </h2>

              <OfficeSwitcher
                office={activeOffice}
                setOffice={changeOffice}
              />
            </div>

            <div className="flex items-center gap-4 pb-5">
              <DateController
                startingWeekStartFocus={
                  currentWeekStartKey
                }
                weekStartFocus={weekStart}
                weekStartFocusDateKey={
                  weekStartKey
                }
                onChangeFocusedWeek={
                  changeWeek
                }
                weekDates={weekDates}
              />

              <div className="h-4 w-0.5 bg-line" />

              <p className="text-sm text-fg">
                <span className="font-bold text-fg">
                  {isCalendarLocked
                    ? externalOfficeSummaries.length > 0
                      ? `Confirmed for ${capitalizeOfficeName(
                          activeOffice.name,
                        )} ✓`
                      : "Confirmed ✓"
                    : externalOfficeSummaries.length > 0
                      ? `Planning for ${capitalizeOfficeName(
                          activeOffice.name,
                        )}.`
                      : "Planning."}
                </span>{" "}
                {externalOfficeSummaries.length > 0
                  ? confirmedElsewhereText(
                      externalOfficeSummaries,
                    )
                  : isCalendarLocked
                    ? "Edit Week to make changes."
                    : "Select your days, then confirm."}
              </p>

              {isWeekConfirmed &&
              !isEditingWeek ? (
                <button
                  type="button"
                  data-tour="confirm-week"
                  onClick={editWeek}
                  disabled={
                    !isAttendanceConnected ||
                    !isPlanningConnected
                  }
                  className={unlockButton}
                >
                  Edit Week
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  data-tour="confirm-week"
                  onClick={
                    handleConfirmWeekClick
                  }
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
              planningByDate={
                planningStatesByDate
              }
              isPlanningConnected={
                isPlanningConnected
              }
              onPlanningToggle={
                handlePlanningToggle
              }
              currentUserExternalVisitsByDate={
                currentUserExternalVisitsByDate
              }
              externalOfficeNamesByDate={
                externalOfficeNamesByDate
              }
              editingUserIds={editingUserIds}
              externalOfficeEmojisByDate={
                externalOfficeEmojisByDate
              }
            />
          </div>
        </div>
      </CalendarMachineProvider>

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
        onCancel={() =>
          setIsNonDefaultOfficeModalOpen(false)
        }
      />

      {!user.is_onboarding_complete && (
        <CalendarTour
          firstName={user.first_name}
        />
      )}
    </div>
  );
}

const darkPillButton =
  "flex h-11 items-center gap-2 rounded-full bg-strong px-5 text-sm font-bold text-fg-inverse transition-colors hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60";

const confirmButton =
  `ml-auto ${darkPillButton} bg-fill hover:bg-fill-hover`;

const unlockButton =
  `ml-auto ${darkPillButton} bg-[#6f281d]! hover:bg-fg!`;

interface OtherOfficeSummary {
  id: number;
  name: string;
  dateKeys: string[];
}

const weekdayFormat =
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  });

const officeListFormat =
  new Intl.ListFormat(undefined, {
    style: "long",
    type: "conjunction",
  });

function parseDateKey(dateKey: string): Date {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function capitalizeOfficeName(
  name: string,
): string {
  return name.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase(),
  );
}

function officeLink(
  office: OtherOfficeSummary,
): ReactNode {
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

function confirmedElsewhereText(
  offices: OtherOfficeSummary[],
): ReactNode {
  if (offices.length === 1) {
    const office = offices[0];

    const days = office.dateKeys
      .map((key) =>
        weekdayFormat.format(
          parseDateKey(key),
        ),
      )
      .join(", ");

    return (
      <>
        You&apos;re at {officeLink(office)}{" "}
        {days} 🔒
      </>
    );
  }

  let elementIndex = 0;

  const nameNodes = officeListFormat
    .formatToParts(
      offices.map((office) =>
        capitalizeOfficeName(office.name),
      ),
    )
    .map((part, index) =>
      part.type === "element" ? (
        officeLink(
          offices[elementIndex++],
        )
      ) : (
        <span key={`separator-${index}`}>
          {part.value}
        </span>
      ),
    );

  return (
    <>
      You&apos;re at {nameNodes} this week 🔒
    </>
  );
}

function useConfirmedUserIds(
  confirmations:
    | AttendanceConfirmation[]
    | undefined,
): ReadonlySet<number> {
  return useMemo(
    () =>
      new Set(
        (confirmations ?? []).map(
          (confirmation) =>
            confirmation.user_id,
        ),
      ),
    [confirmations],
  );
}

