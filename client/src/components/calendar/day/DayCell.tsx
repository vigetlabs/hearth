import { DayHeader } from "@/components/calendar/day/DayHeader";
import { DayRoster } from "@/components/calendar/day/DayRoster";
import type { CalendarScheduleEntry } from "@/types/calendar/schedule/weekSchedule";

interface DayCellProps {
  date: Date;
  /** Id of the office currently being viewed. Threaded to the roster so it can
      reset its In/Out tab whenever the user switches offices. */
  officeId: number;
  /** The full office roster with each person's status for this day. */
  entries: CalendarScheduleEntry[];
  myUserId: number;
  /** Whether the logged-in user has selected this day — "planning" while the
      week is open, "in the office" once it's confirmed. */
  isMine: boolean;
  /** How many visitors from other offices are in the office this day. */
  visitorCount: number;
  /** Whether this is the week's busiest day (the "hot spot"). */
  isHotSpot: boolean;
  /** Whether the week is confirmed (locked). Swaps the interactive header for a
      read-only "confirmed" one. */
  locked: boolean;
  /** Toggle the logged-in user in/out of the office for this day. */
  onToggleMine: () => void;
  isConfirmedElsewhere: boolean;
  externalOfficeName: string;
  externalOfficeEmoji: string;
  /** Name of the office currently being viewed. */
  currentOfficeName: string;
}

export function DayCell({
  date,
  officeId,
  entries,
  myUserId,
  isMine,
  visitorCount,
  isHotSpot,
  locked,
  onToggleMine,
  isConfirmedElsewhere,
  externalOfficeName,
  externalOfficeEmoji,
  currentOfficeName,
}: DayCellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DayHeader
        date={date}
        isSelected={isMine}
        visitorCount={visitorCount}
        isHotSpot={isHotSpot}
        locked={locked}
        myUserId={myUserId}
        onToggleMine={onToggleMine}
        isConfirmedElsewhere={isConfirmedElsewhere}
        externalOfficeName={externalOfficeName}
        externalOfficeEmoji={externalOfficeEmoji}
        currentOfficeName={currentOfficeName}
      />

      <DayRoster
        date={date}
        officeId={officeId}
        entries={entries}
        myUserId={myUserId}
        locked={locked}
      />
    </div>
  );
}
