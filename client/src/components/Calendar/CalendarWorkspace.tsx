import { useCalendarData } from "@/hooks/useCalendarData";
import { useCalendarScope } from "@/hooks/useCalendarScope";
import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";
import CalendarOfficeHeader from "./CalendarOfficeHeader";
import CalendarToolbar from "./CalendarToolbar";
import CalendarContainer from "./CalendarContainer";

export default function CalendarWorkspace() {
  const scope = useCalendarScope();

  const data = useCalendarData({
    userId: scope.user.id,
    officeId: scope.activeOffice.id,
    weekStartKey: scope.focusedWeekStartKey,
  });

  if (data.isPending) {
    return <CalendarPageSkeleton />;
  }

  if (data.isError) {
    return <div>Unable to load calendar data</div>;
  }

  return (
    <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
      <CalendarContainer>
        <CalendarOfficeHeader />

        <CalendarToolbar />
      </CalendarContainer>
    </div>
  );
}
