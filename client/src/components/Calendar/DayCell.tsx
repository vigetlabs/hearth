import { AttendanceGroup } from "@/components/Calendar/AttendanceGroup";
import { DayHeader } from "@/components/Calendar/DayHeader";
import type { AttendanceStatus, PersonStatus } from "@/types/calendar/calendar";

// Confirmed, then planning (maybe), then not going (no); names sort
// alphabetically within each status.
const STATUS_ORDER: Record<AttendanceStatus, number> = {
  confirmed: 0,
  maybe: 1,
  no: 2,
};

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
  const groups = groupByStatus(people);

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

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {groups.map((group, index) => (
          <AttendanceGroup
            key={group.key}
            title={group.title}
            titleClass={group.titleClass}
            status={group.status}
            people={group.people}
            myName={myName}
            defaultOpen={group.defaultOpen}
            divided={index > 0}
            locked={locked}
          />
        ))}
      </div>
    </div>
  );
}

/** Partition a day's roster into the display groups, each sorted by status then
    name, dropping any group that has no people. */
function groupByStatus(people: PersonStatus[]) {
  const sorted = [...people].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.name.localeCompare(b.name),
  );

  return [
    {
      key: "confirmed",
      title: "In the office",
      status: "confirmed" as AttendanceStatus,
      people: sorted.filter((person) => person.status === "confirmed"),
      titleClass: "text-gray-900",
      defaultOpen: true,
    },
    {
      key: "planning",
      title: "Planning",
      status: "maybe" as AttendanceStatus,
      people: sorted.filter((person) => person.status === "maybe"),
      titleClass: "text-gray-900",
      defaultOpen: false,
    },
    {
      key: "notGoing",
      title: "Not going",
      status: "no" as AttendanceStatus,
      people: sorted.filter((person) => person.status === "no"),
      titleClass: "text-gray-900",
      defaultOpen: false,
    },
  ].filter((group) => group.people.length > 0);
}
