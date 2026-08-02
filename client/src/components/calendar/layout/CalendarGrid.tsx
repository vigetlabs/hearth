import { DayCell } from "@/components/calendar/day/DayCell";
import TodayMarker from "@/components/calendar/extras/TodayMarker";
import { useCalendarMachineContext } from "@/hooks/contexts/useCalendarMachineContext";
import { useCalendarScope } from "@/hooks/contexts/useCalendarScopeContext";
import { useCalendarGrid } from "@/hooks/data/useCalendarGrid";
import { WEEKDAYS_PER_WEEK } from "@/util/calendar/viewModel/gridBuilder";

const gridColumns = {
  gridTemplateColumns: `repeat(${WEEKDAYS_PER_WEEK}, minmax(0, 1fr))`,
  gridTemplateRows: "1fr",
};

export default function CalendarGrid() {
  const scope = useCalendarScope();
  const { dispatch } = useCalendarMachineContext();

  //@ TODO: PASS SCOPE INTO CALENDAR GRID HOOK FOR EXPLICIT (LIKE OTHERS)
  const { viewModel, toggleCurrentUser } = useCalendarGrid({
    dispatch
  });

  if (scope.activeOffice.name.toLowerCase() === "remote") {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line px-6 text-center text-sm text-fg-subtle">
        Remote has no weekly office schedule.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {viewModel.todayIndex !== null && (
        <TodayMarker
          dayIndex={viewModel.todayIndex}
          locked={viewModel.locked}
        />
      )}

      <div
        className="grid min-h-0 flex-1 divide-x-2 divide-line overflow-hidden rounded-xl border-2 border-line"
        style={gridColumns}
      >
        {viewModel.days.map((day) => (
          <DayCell
            key={day.key}
            date={day.date}
            officeId={scope.activeOffice.id}
            rosterUsers={day.rosterUsers}
            myUserId={scope.user.id}
            isMine={day.currentUserSelected}
            visitorCount={day.visitorCount}
            isHotSpot={day.isHotSpot}
            locked={viewModel.locked}
            onToggleMine={() => toggleCurrentUser(day.key)}
            isConfirmedElsewhere={day.isConfirmedElsewhere}
            externalOfficeName={day.externalOfficeName}
            externalOfficeEmoji={day.externalOfficeEmoji}
            currentOfficeName={scope.activeOffice.name}
          />
        ))}
      </div>
    </div>
  );
}
