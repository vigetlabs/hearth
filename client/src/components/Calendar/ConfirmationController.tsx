import { useMemo } from "react";

import PencilIcon from "@/components/icons/PencilIcon";

import type { CalendarData } from "@/hooks/useCalendarData";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { getCapabilitiesFor } from "@/util/calendar/machineCapabilities";
import { useCalendarMachine } from "@/util/calendar/MachineProvider";
import { machineStates } from "@/types/calendar/machineState";

interface ConfirmationControllerProps {
  data: CalendarData;
  isPlanningConnected: boolean;
  isAttendanceConnected: boolean;
}

interface ExternalOfficeSummary {
  id: number;
  name: string;
  dateKeys: string[];
}

const darkPillButton =
  "flex h-11 items-center gap-2 rounded-full bg-strong px-5 text-sm font-bold text-fg-inverse transition-colors hover:bg-strong-hover disabled:cursor-not-allowed disabled:opacity-60";

const confirmButton = `ml-auto ${darkPillButton} bg-fill hover:bg-fill-hover`;

const unlockButton = `ml-auto ${darkPillButton} bg-[#6f281d]! hover:bg-fg!`;

function capitalizeOfficeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function confirmedElsewhereText(
  summaries: ExternalOfficeSummary[],
): string {
  const officeDescriptions = summaries.map((summary) => {
    const dateCount = summary.dateKeys.length;

    return `${dateCount} ${
      dateCount === 1 ? "day" : "days"
    } at ${capitalizeOfficeName(summary.name)}`;
  });

  if (officeDescriptions.length === 1) {
    return `You are also confirmed for ${officeDescriptions[0]}.`;
  }

  const lastDescription = officeDescriptions.at(-1);
  const precedingDescriptions = officeDescriptions.slice(0, -1);

  return `You are also confirmed for ${precedingDescriptions.join(
    ", ",
  )}, and ${lastDescription}.`;
}

export default function ConfirmationController({
  data,
  isPlanningConnected,
  isAttendanceConnected,
}: ConfirmationControllerProps) {
  const {
    offices,
    activeOffice,
  } = useCalendarScope();

  const {
    state: machineState,
    dispatch: machineDispatch,
  } = useCalendarMachine();

  const capabilities = getCapabilitiesFor(machineState);

  const externalOfficeSummaries = useMemo(() => {
    const summariesByOfficeId = new Map<
      number,
      ExternalOfficeSummary
    >();

    for (const visit of data.currentUserVisits) {
      if (visit.office_id === activeOffice.id) {
        continue;
      }

      const office = offices.find(
        (candidate) => candidate.id === visit.office_id,
      );

      if (!office) {
        continue;
      }

      const existingSummary = summariesByOfficeId.get(office.id);

      if (existingSummary) {
        existingSummary.dateKeys.push(visit.visit_date);
        continue;
      }

      summariesByOfficeId.set(office.id, {
        id: office.id,
        name: office.name,
        dateKeys: [visit.visit_date],
      });
    }

    return [...summariesByOfficeId.values()];
  }, [
    activeOffice.id,
    data.currentUserVisits,
    offices,
  ]);

  const isConfirmed =
    machineState.status === machineStates.CONFIRMED

  const isPlanning =
    machineState.status === machineStates.PLANNING

  const isConfirming =
    machineState.status === machineStates.CONFIRMING

  const isCalendarLocked =
    isConfirmed && !isPlanning;

  function handleEditClick(): void {
    machineDispatch({
      type: "EDIT_REQUESTED",
    });
  }

  function handleSubmitClick(): void {
    if (isPlanning) {
      machineDispatch({
        type: "SAVE_EDITS_REQUESTED",
      });

      return;
    }

    machineDispatch({
      type: "CONFIRM_REQUESTED",
    });
  }

  return (
    <>
      <p className="text-sm text-fg">
        <span className="font-bold text-fg">
          {isCalendarLocked
            ? externalOfficeSummaries.length >= 1
              ? `Confirmed for ${capitalizeOfficeName(
                  activeOffice.name,
                )} ✓`
              : "Confirmed ✓"
            : externalOfficeSummaries.length >= 1
              ? `Planning for ${capitalizeOfficeName(
                  activeOffice.name,
                )}.`
              : "Planning."}
        </span>{" "}

        {externalOfficeSummaries.length >= 1
          ? confirmedElsewhereText(externalOfficeSummaries)
          : isCalendarLocked
            ? "Edit Week to make changes."
            : "Select your days, then confirm."}
      </p>

      {capabilities.canStartEditing ? (
        <button
          type="button"
          data-tour="confirm-week"
          onClick={handleEditClick}
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
          onClick={handleSubmitClick}
          disabled={
            !capabilities.canConfirm ||
            isConfirming ||
            !isPlanningConnected
          }
          className={confirmButton}
        >
          {isConfirming
            ? "Confirming..."
            : isPlanning
              ? "Saving..."
              : isPlanning
                ? "Save Week"
                : "Confirm Week"}
        </button>
      )}
    </>
  );
}
