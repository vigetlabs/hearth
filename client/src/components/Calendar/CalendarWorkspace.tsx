import { useCalendarData } from "@/hooks/useCalendarData";
import { useCalendarScope } from "@/hooks/useCalendarScopeContext";
import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";
import CalendarOfficeHeader from "./CalendarOfficeHeader";
import CalendarToolbar from "./CalendarToolbar";
import CalendarContainer from "./CalendarContainer";
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
    <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
      <CalendarContainer>
        <CalendarOfficeHeader />
    <CalendarDataProvider value={data}>
      <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
        <CalendarWorkspaceCard>
          <CalendarOfficeHeader />

        <CalendarToolbar />
      </CalendarContainer>
    </div>
          <CalendarToolbar />
        </CalendarWorkspaceCard>
      </div>
    </CalendarDataProvider>
  );
}
