import { useCalendarData } from "@/hooks/useCalendarData";
import { useCalendarScope } from "@/hooks/useCalendarScope";
import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";

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

  return <div>State: {String(data.isError)}</div>;
}
