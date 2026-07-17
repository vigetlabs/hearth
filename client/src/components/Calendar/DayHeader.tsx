import { StatusIcon } from "@/components/Calendar/StatusIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import FlameIcon from "@/components/icons/FlameIcon";
import MinusIcon from "@/components/icons/MinusIcon";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

interface DayHeaderProps {
  date: Date;
  /** Whether the logged-in user has selected this day. */
  isSelected: boolean;
  /** How many visitors from other offices are in that day */
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

      <BadgeStack
        visitorCount={visitorCount}
        isHotSpot={isHotSpot}
        visitorClass="bg-strong text-fg-inverse"
        emptyClass="text-fg-faint"
        hotSpotClass="bg-strong text-fg-inverse"
      />
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

      <BadgeStack
        visitorCount={visitorCount}
        isHotSpot={isHotSpot}
        visitorClass="bg-surface text-fg"
        emptyClass={isSelected ? "text-fg-inverse-muted" : "text-fg-faint"}
        hotSpotClass="bg-surface text-fg"
      />
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

/** The stacked badge area beneath the date. Both rows are always rendered as
    fixed-height slots so every header is the same height regardless of which
    badges are present — matching the tallest case (both badges shown). */
function BadgeStack({
  visitorCount,
  isHotSpot,
  visitorClass,
  emptyClass,
  hotSpotClass,
}: {
  visitorCount: number;
  isHotSpot: boolean;
  visitorClass: string;
  emptyClass: string;
  hotSpotClass: string;
}) {
  return (
    <span className="mt-2 flex flex-col items-start gap-2">
      <span className={badgeSlot}>
        {visitorCount > 0 ? (
          <span className={`${badge} ${visitorClass}`}>
            {visitorCount} visitors
          </span>
        ) : (
          <span className={`whitespace-nowrap text-xs ${emptyClass}`}>
            No confirmed plans yet
          </span>
        )}
      </span>
      <span className={badgeSlot}>
        {isHotSpot && (
          <span className={`${badge} ${hotSpotClass}`}>
            Most confirmed
            <FlameIcon className="h-2.5 w-2.5" />
          </span>
        )}
      </span>
    </span>
  );
}

const headerBase = "block w-full shrink-0 px-4 pb-3 pt-4 text-left";

const iconCircle =
  "flex h-7 w-7 items-center justify-center rounded-full border";

const badge =
  "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide";

/** Fixed-height row so an absent badge still reserves its vertical space. */
const badgeSlot = "flex h-5 items-center";
