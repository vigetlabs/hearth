import { CalendarMachineContext } from "@/contexts/CalendarMachineContext";
import { useContext } from "react";

export function useCalendarMachineContext() {
  const context = useContext(CalendarMachineContext);

  if (!context) {
    throw new Error(
      "useCalendarMachineContext must be used inside a CalendarMachineProvider"
    );
  }
  return context;
}
