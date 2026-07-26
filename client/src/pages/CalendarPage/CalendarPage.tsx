import CalendarPageSkeleton from "@/pages/CalendarPage/CalendarPageSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCalendarOfficeSelection } from "@/hooks/useCalendarOfficeSelection";
import { useCalendarWeekSelection } from "@/hooks/useCalendarWeekSelection";
import CalendarPageContent from "@/components/Calendar/CalendarPageContent";

import type { ResolvedOfficeSelection } from "@/types/calendar/hooks";


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

  return (
    <CalendarPageContent
      user={user}
      officeSelection={officeSelection as ResolvedOfficeSelection}
      weekSelection={weekSelection}
    />
  );
}

