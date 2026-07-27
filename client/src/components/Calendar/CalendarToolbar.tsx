import ConfirmationController from "./ConfirmationController";
import DateController from "@/components/Calendar/DateController";

import type { CalendarData } from "@/hooks/useCalendarData";

interface CalendarToolbarProps {
  data: CalendarData;
}

export default function CalendarToolbar({
  data,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center gap-4 pb-5">
      <DateController />

      <div
        aria-hidden="true"
        className="h-4 w-0.5 shrink-0 bg-line"
      />

      <ConfirmationController data={data} />
    </div>
  );
}
