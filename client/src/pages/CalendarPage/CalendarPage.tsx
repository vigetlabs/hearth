import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";
import CalendarWorkspace from "@/components/Calendar/CalendarWorkspace";
import { CalendarScopeProvider } from "@/contexts/CalendarScopeProvider";
import type { CalendarScope } from "@/contexts/CalendarScopeContext";
import { useAuth } from "@/util/auth/useAuth";
import { useCalendarOfficeSelection } from "@/hooks/useCalendarOfficeSelection";
import { useCalendarWeekSelection } from "@/hooks/useCalendarWeekSelection";

export default function CalendarPage() {
  const { user } = useAuth();

  const officeSelection = useCalendarOfficeSelection(user);
  const weekSelection = useCalendarWeekSelection();

  if (officeSelection.isLoading) {
    return <CalendarPageSkeleton />;
  }

  if (officeSelection.isError) {
    return <div>Unable to load calendar</div>;
  }

  if (!user) {
    return <div>No user is available</div>;
  }

  if (!officeSelection.activeOffice) {
    return <div>No office is available</div>;
  }

  const scope: CalendarScope = {
    user,
    offices: officeSelection.offices,
    activeOffice: officeSelection.activeOffice,
    focusedWeekStart: weekSelection.weekStart,
    focusedWeekStartKey: weekSelection.weekStartKey,
    changeOffice: officeSelection.changeOffice,
    changeWeek: weekSelection.changeWeek,
  };

  return (
    <CalendarScopeProvider value={scope}>
      <CalendarWorkspace />
    </CalendarScopeProvider>
  );
}
