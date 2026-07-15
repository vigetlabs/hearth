import { DayHeader } from "@/components/Calendar/DayHeader";
import { DayRoster } from "@/components/Calendar/DayRoster";
import type { PersonStatus } from "@/types/calendar/calendar";

interface DayCellProps {
  date: Date;
  /** The full office roster with each person's status for this day. */
  people: PersonStatus[];
  /** Display name of the logged-in user, highlighted in the list. */
  myName: string;
  /** Whether the logged-in user has selected this day — "planning" while the
      week is open, "in the office" once it's confirmed. */
  isMine: boolean;
  /** How many people are confirmed this day. */
  confirmedCount: number;
  /** Total office roster size, the denominator for the confirmed count. */
  total: number;
  /** Confirmed headcount as a 0–1 fraction of the office roster. */
  fill: number;
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
  myName,
  isMine,
  confirmedCount,
  total,
  fill,
  isHotSpot,
  locked,
  onToggleMine,
}: DayCellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DayHeader
        date={date}
        isMine={isMine}
        confirmedCount={confirmedCount}
        total={total}
        fill={fill}
        isHotSpot={isHotSpot}
        locked={locked}
        myName={myName}
        onToggleMine={onToggleMine}
      />

      <DayRoster people={people} myName={myName} />
    </div>
  );
}
