import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import { useCalendarData } from "@/hooks/data/useCalendarData";
import CalendarOfficeHeader from "@/components/calendar/layout/CalendarOfficeHeader";
import CalendarContainer from "@/components/calendar/layout/CalendarContainer";
import CalendarGrid from "@/components/calendar/layout/CalendarGrid";
import CalendarPageSkeleton from "@/components/feedback/CalendarSkeletonLoader";
import CalendarToolbar from "@/components/calendar/layout/CalendarToolbar";
import { CalendarDataProvider } from "@/contexts/CalendarDataProvider";

export default function CalendarWorkspace() {
  const scope = useCalendarScope();

  //loads persisted records form DB (visits, currentUser visits, confirmations, etc).
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
    <CalendarDataProvider value={data}>
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
