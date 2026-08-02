import type { CalendarMachineBootstrap } from "@/types/calendar/machine/machineBootstrap";

interface CalendarMachineProviderProps {
  bootstrap: CalendarMachineBootstrap;
  children: React.ReactNode;
}

export function CalendarMachineProvider({
  bootstrap,
  children
}: CalendarMachineProviderProps) {
}
