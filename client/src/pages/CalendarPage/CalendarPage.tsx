import CalendarPageSkeleton from "@/components/feedback/CalendarSkeletonLoader";
import CalendarWorkspace from "@/components/calendar/CalendarWorkspace";
import { CalendarScopeProvider } from "@/contexts/CalendarScopeProvider";
import type { CalendarScope } from "@/contexts/CalendarScopeContext";
import { useAuth } from "@/hooks/contexts/useAuth";
import { useCalendarOfficeSelection } from "@/hooks/selection/useCalendarOfficeSelection";
import { useCalendarWeekSelection } from "@/hooks/selection/useCalendarWeekSelection";
import CalendarWorkspaceRoot from "@/components/calendar/layout/CalendarWorkspaceRoot";

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
      <CalendarWorkspaceRoot>
        <div className="relative flex flex-1 flex-col overflow-hidden bg-page">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_top_left,rgba(180,72,32,0.14),transparent),radial-gradient(60%_60%_at_right_82%,rgba(180,72,32,0.14),transparent)]"
          />
          <CalendarWorkspace />
        </div>
      </CalendarWorkspaceRoot>
    </CalendarScopeProvider>
  );
}
