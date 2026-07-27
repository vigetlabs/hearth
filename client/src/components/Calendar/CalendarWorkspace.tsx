import { CalendarDataProvider } from "@/contexts/CalendarDataProvider";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import { useCalendarData } from "@/hooks/data/useCalendarData";
import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";

import CalendarContainer from "./CalendarContainer";
import CalendarGrid from "./CalendarGrid";
import CalendarOfficeHeader from "./CalendarOfficeHeader";
import CalendarToolbar from "./CalendarToolbar";

export default function CalendarWorkspace() {
  const scope = useCalendarScope();

  // Loads persisted records from the database:
  // visits, current-user visits, confirmations, etc.
  const data = useCalendarData({
    userId: scope.user.id,
    officeId: scope.activeOffice.id,
    weekStartKey: scope.focusedWeekStartKey,
  });

  if (data.isPending) {
    return <CalendarPageSkeleton />;
  }

  if (data.isError) {
    return <p>Unable to load calendar data.</p>;
  }

  return (
    <CalendarDataProvider value={data.calendarData}>
      <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
        <CalendarContainer>
          <CalendarOfficeHeader />
          <CalendarToolbar />
          <CalendarGrid />
        </CalendarContainer>
      </div>
    </CalendarDataProvider>
  );
}
