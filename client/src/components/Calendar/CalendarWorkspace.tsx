import type { CalendarData } from "@/hooks/useCalendarData";
import type { CalendarScope } from "@/types/calendar/scope";
import { useCalendarScope } from "@/util/calendar/CalendarScopeProvider";
import { getCapabilitiesFor } from "@/util/calendar/machineCapabilities";
import { useCalendarMachine } from "@/util/calendar/MachineProvider";

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

  return (
    <div>
    </div>
  )
}
