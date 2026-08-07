import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import CalendarTour from "../extras/CalendarTour";

interface CalendarContainer {
  children: React.ReactNode;
}

export default function CalendarContainer({ children }: CalendarContainer) {
  const scope = useCalendarScope();
  const isOnboardingComplete = scope.user.is_onboarding_complete;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-line bg-surface p-6 shadow-card">
      {children}
      {!isOnboardingComplete && (
        <CalendarTour firstName={scope.user.first_name} />
      )}
    </div>
  );
}
