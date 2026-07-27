import CalendarMachineBoundary from "@/components/Calendar/CalendarMachineBoundary";
import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";

import { useAuth } from "@/hooks/useAuth";
import { useCalendarOfficeSelection } from "@/hooks/useCalendarOfficeSelection";
import { useCalendarWeekSelection } from "@/hooks/useCalendarWeekSelection";
import type { CalendarScope } from "@/types/calendar/scope";
import { CalendarScopeProvider } from "@/util/calendar/CalendarScopeProvider";

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
      <main className="relative flex flex-1 flex-col overflow-hidden bg-page">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_top_left,rgba(180,72,32,0.14),transparent),radial-gradient(60%_60%_at_right_82%,rgba(180,72,32,0.14),transparent)]"
        />

        <div className="relative mx-auto flex min-h-0 w-[90%] flex-1 flex-col pt-6 pb-8">
          <CalendarMachineBoundary />
        </div>
      </main>
    </CalendarScopeProvider>
  );
}
