import { Link } from "react-router";

import type { CalendarData } from "@/hooks/useCalendarData";
import type { CalendarScope } from "@/types/calendar/scope";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { getCapabilitiesFor } from "@/util/calendar/machineCapabilities";
import { useCalendarMachine } from "@/util/calendar/MachineProvider";
import CalendarOfficeHeader from "./CalendarOfficeHeader";
import CalendarToolbar from "./CalendarToolbar";

interface CalendarWorkspaceProps {
  data: CalendarData
}

export default function CalendarWorkspace({
  data
}: CalendarWorkspaceProps) {
  const scope = useCalendarScope();

  const {
    state: machineState,
    dispatch: machineDispatch,
  } = useCalendarMachine();

  const capabilities = getCapabilitiesFor(machineState);

  const isDefaultOfficeRemote =
    scope.user.office.id !== null &&
    scope.offices.find(
      (office) => office.id === scope.user.office.id
    )?.name.toLowerCase() === "remote"


  return (
    <div>
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

        <CalendarToolbar data={data} />
      </section>
    </div>
  )
}
