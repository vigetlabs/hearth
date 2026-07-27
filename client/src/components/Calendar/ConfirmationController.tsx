import type { ReactNode } from "react";
import { Link } from "react-router";

import PencilIcon from "@/components/icons/PencilIcon";

import type { CalendarData } from "@/hooks/useCalendarData";
import { machineStates } from "@/types/calendar/machineState";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { getCapabilitiesFor } from "@/util/calendar/machineCapabilities";
import { useCalendarMachine } from "@/util/calendar/MachineProvider";

interface ConfirmationControllerProps {
  data: CalendarData;
}

interface OtherOfficeSummary {
  id: number;
  name: string;
  dateKeys: string[];
}

const darkPillButton =
  "flex h-11 items-center gap-2 rounded-full bg-strong px-5 text-sm font-bold text-fg-inverse transition-colors hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60";

const confirmButton =
  `ml-auto ${darkPillButton} bg-fill hover:bg-fill-hover`;

const unlockButton =
  `ml-auto ${darkPillButton} bg-[#6f281d]! hover:bg-fg!`;


const weekdayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
});

const officeListFormat = new Intl.ListFormat(undefined, {
  style: "long",
  type: "conjunction",
});

export default function ConfirmationController({
  data,
}: ConfirmationControllerProps) {
  const { offices, activeOffice } = useCalendarScope();

  const {
    state: machineState,
    dispatch: machineDispatch,
  } = useCalendarMachine();

  const capabilities = getCapabilitiesFor(machineState);

  const isConfirmed =
    machineState.status === machineStates.CONFIRMED;

  const isConfirming =
    machineState.status === machineStates.CONFIRMING;

  const officesById = new Map(
    offices.map((office) => [office.id, office]),
  );

  const externalOfficeSummaries =
    buildExternalOfficeSummaries({
      currentUserVisits: data.currentUserVisits,
      activeOfficeId: activeOffice.id,
      officesById,
    });

  const hasExternalVisits =
    externalOfficeSummaries.length > 0;

  function requestConfirmation(): void {
    machineDispatch({
      type: "CONFIRM_REQUESTED",
    });
  }

  function requestEditing(): void {
    machineDispatch({
      type: "EDIT_REQUESTED",
    });
  }

  return (
    <>
      <p className="text-sm text-fg">
        <span className="font-bold text-fg">
          {isConfirmed
            ? hasExternalVisits
              ? `Confirmed for ${capitalizeOfficeName(
                  activeOffice.name,
                )} ✓`
              : "Confirmed ✓"
            : hasExternalVisits
              ? `Planning for ${capitalizeOfficeName(
                  activeOffice.name,
                )}.`
              : "Planning."}
        </span>{" "}
        {hasExternalVisits
          ? confirmedElsewhereText(
              externalOfficeSummaries,
            )
          : isConfirmed
            ? "Edit Week to make changes."
            : "Select your days, then confirm."}
      </p>

      {isConfirmed ? (
        <button
          type="button"
          data-tour="confirm-week"
          onClick={requestEditing}
          className={unlockButton}
          disabled={!capabilities.canStartEditing}
        >
          Edit Week
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          data-tour="confirm-week"
          onClick={requestConfirmation}
          disabled={!capabilities.canConfirm}
          className={confirmButton}
        >
          {isConfirming
            ? "Confirming..."
            : "Confirm Week"}
        </button>
      )}
    </>
  );
}

interface BuildExternalOfficeSummariesOptions {
  currentUserVisits: CalendarData["currentUserVisits"];
  activeOfficeId: number;
  officesById: Map<
    number,
    ReturnType<typeof useCalendarScope>["offices"][number]
  >;
}

function buildExternalOfficeSummaries({
  currentUserVisits,
  activeOfficeId,
  officesById,
}: BuildExternalOfficeSummariesOptions): OtherOfficeSummary[] {
  const summariesByOfficeId = new Map<
    number,
    OtherOfficeSummary
  >();

  for (const visit of currentUserVisits) {
    if (visit.office_id === activeOfficeId) {
      continue;
    }

    const office = officesById.get(visit.office_id);

    if (!office) {
      continue;
    }

    const existingSummary =
      summariesByOfficeId.get(office.id);

    if (existingSummary) {
      existingSummary.dateKeys.push(
        visit.visit_date,
      );
      continue;
    }

    summariesByOfficeId.set(office.id, {
      id: office.id,
      name: office.name,
      dateKeys: [visit.visit_date],
    });
  }

  return Array.from(
    summariesByOfficeId.values(),
  ).map((summary) => ({
    ...summary,
    dateKeys: summary.dateKeys.toSorted(),
  }));
}

function capitalizeOfficeName(
  name: string,
): string {
  return name.replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
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
      .map((dateKey) =>
        weekdayFormat.format(
          parseDateKey(dateKey),
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

  let officeIndex = 0;

  const officeNameNodes = officeListFormat
    .formatToParts(
      offices.map((office) =>
        capitalizeOfficeName(office.name),
      ),
    )
    .map((part, partIndex) => {
      if (part.type === "element") {
        const office = offices[officeIndex++];

        return officeLink(office);
      }

      return (
        <span key={`separator-${partIndex}`}>
          {part.value}
        </span>
      );
    });

  return (
    <>
      You&apos;re at {officeNameNodes} this
      week 🔒
    </>
  );
}
