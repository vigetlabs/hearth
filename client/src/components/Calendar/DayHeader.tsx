import { StatusIcon } from "@/components/Calendar/StatusIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import FlameIcon from "@/components/icons/FlameIcon";
import MinusIcon from "@/components/icons/MinusIcon";
import { cn } from "@/util/cn";

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
  isConfirmedElsewhere: boolean;
  externalOfficeName: string;
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
  isConfirmedElsewhere,
  externalOfficeName,
}: Omit<DayHeaderProps, "locked">) {
  return (
    <button
      type="button"
      onClick={onToggleMine}
      disabled={!myUserId || isConfirmedElsewhere}
      aria-pressed={isSelected}
      aria-label={
        isConfirmedElsewhere
          ? `Confirmed at ${externalOfficeName}`
          : isSelected
            ? "You're planning this day — remove yourself"
            : "Add yourself to this day"
      }
      className={cn(
        headerBase,
        "border-b border-line transition-colors disabled:cursor-not-allowed",
        isConfirmedElsewhere
          ? "bg-red-500"
          : isSelected
            ? "bg-selected hover:bg-line-selected"
            : "bg-surface hover:bg-surface-sunken",
      )}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          weekdayClass="text-fg"
          dateNumClass="text-fg"
        />

        <StatusIcon
          size="xl"
          variant="dashed"
          weight="thin"
          mark={isSelected ? "add" : "planning-yes"}
          className={cn(
            "border-2 bg-transparent",
            isSelected ? "border-strong" : "border-fg",
          )}
        />
      </span>

      {isConfirmedElsewhere && (
        <span className="mt-2 block text-sm font-semibold">
          Confirmed at {externalOfficeName}
        </span>
      )}

      <BadgeStack
        visitorCount={visitorCount}
        isHotSpot={isHotSpot}
        visitorClass="bg-strong text-fg-inverse"
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
  isConfirmedElsewhere,
  externalOfficeName,
}: Omit<DayHeaderProps, "locked" | "myUserId" | "onToggleMine">) {
  return (
    <div
      className={cn(
        headerBase,
        "border-b border-line",
        isConfirmedElsewhere
          ? "bg-red-500 text-white"
          : isSelected
            ? "bg-strong text-fg-inverse"
            : "bg-surface-strong text-fg",
      )}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          weekdayClass={
            isConfirmedElsewhere
              ? "text-white"
              : isSelected
                ? ""
                : "text-[#8A7A6E]"
          }
          dateNumClass={
            isConfirmedElsewhere
              ? "text-white/80"
              : isSelected
                ? "text-fg-inverse-muted"
                : "text-[#8A7A6E]"
          }
        />

        <span
          className={cn(
            iconCircle,
            isSelected
              ? "border-[#451811] bg-[#451811] text-white"
              : "border-fg-muted bg-transparent text-fg-muted",
          )}
          aria-hidden="true"
        >
          {isSelected ? (
            <CheckIcon className="h-5 w-5" weight="thin" />
          ) : (
            <MinusIcon className="h-5 w-5" weight="thin" />
          )}
        </span>
      </span>

      {isConfirmedElsewhere && (
        <span className="mt-2 block text-sm font-semibold">
          Confirmed at {externalOfficeName}
        </span>
      )}

      <BadgeStack
        visitorCount={visitorCount}
        isHotSpot={isHotSpot}
        visitorClass="bg-surface text-fg"
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
      <span className={cn("block text-xl font-bold", weekdayClass)}>
        {weekdayFormat.format(date)}
      </span>
      <span className={cn("block text-sm", dateNumClass)}>
        {date.getDate()}
      </span>
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
  hotSpotClass,
}: {
  visitorCount: number;
  isHotSpot: boolean;
  visitorClass: string;
  hotSpotClass: string;
}) {
  return (
    <span className="mt-2 flex flex-col items-start gap-2">
      <span className={badgeSlot}>
        {visitorCount > 0 && (
          <span className={cn(badge, visitorClass)}>
            {visitorCount} visitors
          </span>
        )}
      </span>
      <span className={badgeSlot}>
        {isHotSpot && (
          <span className={cn(badge, hotSpotClass)}>
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
  "flex h-8 w-8 items-center justify-center rounded-full border-2";

const badge =
  "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide";

/** Fixed-height row so an absent badge still reserves its vertical space. */
const badgeSlot = "flex h-5 items-center";
