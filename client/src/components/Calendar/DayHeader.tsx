import { StatusIcon } from "@/components/Calendar/StatusIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import FlameIcon from "@/components/icons/FlameIcon";
import MinusIcon from "@/components/icons/MinusIcon";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

interface DayHeaderProps {
  date: Date;
  /** Whether the logged-in user has selected this day. */
  isSelected: boolean;
  /** How many people are confirmed this day. */
  visitorCount: number;
  /** Whether this is the week's busiest day (the "hot spot"). */
  isHotSpot: boolean;
  /** Whether the week is confirmed (locked). Swaps the interactive header for a
      read-only "confirmed" one. */
  locked: boolean;
  myUserId: number;
  /** Toggle the logged-in user in/out of the office for this day. */
  onToggleMine: () => void;
}

export function DayHeader({ locked, ...props }: DayHeaderProps) {
  return locked ? (
    <ConfirmedHeader {...props} />
  ) : (
    <PlanningHeader {...props} />
  );
}

/** Interactive header shown while the week is still being planned. */
function PlanningHeader({
  date,
  isSelected,
  visitorCount,
  isHotSpot,
  myUserId,
  onToggleMine,
}: Omit<DayHeaderProps, "locked">) {
  return (
    <button
      type="button"
      onClick={onToggleMine}
      disabled={!myUserId}
      aria-pressed={isSelected}
      aria-label={
        isSelected
          ? "You're planning this day — remove yourself"
          : "Add yourself to this day"
      }
      className={`${headerBase} border-b border-line transition-colors disabled:cursor-not-allowed ${
        isSelected
          ? "bg-surface-strong hover:bg-line-strong"
          : "bg-surface hover:bg-surface-muted"
      }`}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          weekdayClass="text-fg"
          dateNumClass="text-fg-subtle"
        />
        <StatusIcon
          size="lg"
          variant="dashed"
          mark={isSelected ? "confirmed-yes" : "add"}
        />
      </span>

      <span className="mt-2 flex flex-wrap items-center gap-2">
        <VisitorCount
          visitorCount={visitorCount}
          className="bg-strong text-fg-inverse"
          emptyClass="text-fg-faint"
        />
        {isHotSpot && <HotSpotBadge className="bg-strong text-fg-inverse" />}
      </span>
    </button>
  );
}

/** Read-only header shown once the week is confirmed (locked). */
function ConfirmedHeader({
  date,
  isSelected,
  visitorCount,
  isHotSpot,
}: Omit<DayHeaderProps, "locked" | "myName" | "onToggleMine">) {
  return (
    <div
      className={`${headerBase} border-b ${
        isSelected
          ? "border-strong-hover bg-strong text-fg-inverse"
          : "border-line bg-surface-strong text-fg"
      }`}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          dateNumClass={isSelected ? "text-fg-inverse-muted" : "text-fg-subtle"}
        />
        <span
          className={`${iconCircle} ${
            isSelected
              ? "border-fg-inverse text-fg-inverse"
              : "border-strong text-fg"
          }`}
          aria-hidden="true"
        >
          {isSelected ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <MinusIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </span>

      <span className="mt-2 flex flex-wrap items-center gap-2">
        <VisitorCount
          visitorCount={visitorCount}
          className="bg-surface text-fg"
          emptyClass={isSelected ? "text-fg-inverse-muted" : "text-fg-faint"}
        />
        {isHotSpot && <HotSpotBadge className="bg-surface text-fg" />}
      </span>
    </div>
  );
}

function DayDateLabel({
  date,
  weekdayClass = "",
  dateNumClass,
}: {
  date: Date;
  weekdayClass?: string;
  dateNumClass: string;
}) {
  return (
    <span className="block">
      <span className={`block text-xl font-bold ${weekdayClass}`}>
        {weekdayFormat.format(date)}
      </span>
      <span className={`block text-sm ${dateNumClass}`}>{date.getDate()}</span>
    </span>
  );
}

function VisitorCount({
  visitorCount,
  emptyClass,
  className,
}: {
  visitorCount: number;
  emptyClass: string;
  className: string;
}) {
  return visitorCount > 0 ? (
    <span className={`${badge} ${className}`}>{visitorCount} visitors</span>
  ) : (
    <span className={`whitespace-nowrap text-xs ${emptyClass}`}>
      No confirmed plans yet
    </span>
  );
}

function HotSpotBadge({ className }: { className: string }) {
  return (
    <span className={`${badge} ${className}`}>
      Most confirmed
      <FlameIcon className="h-2.5 w-2.5" />
    </span>
  );
}

const headerBase = "block w-full shrink-0 px-4 pb-3 pt-4 text-left";

const iconCircle =
  "flex h-7 w-7 items-center justify-center rounded-full border";

const badge =
  "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide";
