import { DayHeader } from "@/components/Calendar/DayHeader";
import { DayRoster } from "@/components/Calendar/DayRoster";
import type { PersonStatus } from "@/types/calendar/calendar";

interface DayCellProps {
  date: Date;
  /** The full office roster with each person's status for this day. */
  people: PersonStatus[];
  myUserId: number;
  /** Whether the logged-in user has selected this day — "planning" while the
      week is open, "in the office" once it's confirmed. */
  isMine: boolean;
  /** How many people are confirmed this day. */
  visitorCount: number;
  /** Total office roster size, the denominator for the confirmed count. */
  total: number;
  /** Whether this is the week's busiest day (the "hot spot"). */
  isHotSpot: boolean;
  /** Whether the week is confirmed (locked). Swaps the interactive header for a
      read-only "confirmed" one. */
  locked: boolean;
  /** Toggle the logged-in user in/out of the office for this day. */
  onToggleMine: () => void;
}

export function DayCell({
  date,
  people,
  myUserId,
  isMine,
  visitorCount,
  isHotSpot,
  locked,
  onToggleMine,
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
      />

      <DayRoster people={people} myUserId={myUserId} />
    </div>
  );
}
