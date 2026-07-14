import CheckIcon from "@/components/icons/CheckIcon";
import MinusIcon from "@/components/icons/MinusIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import { cn } from "@/util/cn";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

interface DayHeaderProps {
  date: Date;
  /** Whether the logged-in user has selected this day. */
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
  /** Display name of the logged-in user; empty disables the toggle. */
  myName: string;
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
  isMine,
  confirmedCount,
  total,
  fill,
  isHotSpot,
  myName,
  onToggleMine,
}: Omit<DayHeaderProps, "locked">) {
  return (
    <button
      type="button"
      onClick={onToggleMine}
      disabled={!myName}
      aria-pressed={isMine}
      aria-label={
        isMine
          ? "You're planning this day — remove yourself"
          : "Add yourself to this day"
      }
      className={cn(
        headerBase,
        "border-b border-gray-200 transition-colors disabled:cursor-not-allowed",
        isMine ? "bg-gray-200 hover:bg-gray-300" : "bg-white hover:bg-gray-100",
      )}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          weekdayClass="text-gray-900"
          dateNumClass="text-gray-500"
        />
        <span
          className={cn(
            iconCircle,
            "border-dashed border-gray-400 text-gray-700",
          )}
          aria-hidden="true"
        >
          {isMine ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <PlusIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </span>

      <ProgressBar
        fill={fill}
        trackClass="bg-gray-300"
        barClass={isHotSpot ? "bg-gray-900" : "bg-gray-500"}
      />

      <span className="mt-2 flex flex-wrap items-center gap-2">
        <ConfirmedCount
          confirmedCount={confirmedCount}
          total={total}
          countClass="text-gray-600"
          emptyClass="text-gray-400"
        />
        {isHotSpot && <HotSpotBadge className="bg-gray-900 text-white" />}
      </span>
    </button>
  );
}

/** Read-only header shown once the week is confirmed (locked). */
function ConfirmedHeader({
  date,
  isMine,
  confirmedCount,
  total,
  fill,
  isHotSpot,
}: Omit<DayHeaderProps, "locked" | "myName" | "onToggleMine">) {
  return (
    <div
      className={cn(
        headerBase,
        "border-b",
        isMine
          ? "border-gray-800 bg-gray-900 text-white"
          : "border-gray-200 bg-gray-200 text-gray-900",
      )}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          dateNumClass={isMine ? "text-gray-300" : "text-gray-500"}
        />
        <span
          className={cn(
            iconCircle,
            isMine
              ? "border-white text-white"
              : "border-gray-900 text-gray-900",
          )}
          aria-hidden="true"
        >
          {isMine ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <MinusIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </span>

      <ProgressBar
        fill={fill}
        trackClass={isMine ? "bg-white/25" : "bg-gray-300"}
        barClass={
          isMine ? "bg-white" : isHotSpot ? "bg-gray-900" : "bg-gray-500"
        }
      />

      <span className="mt-2 flex flex-wrap items-center gap-2">
        <ConfirmedCount
          confirmedCount={confirmedCount}
          total={total}
          countClass={isMine ? "text-gray-200" : "text-gray-600"}
          emptyClass={isMine ? "text-gray-300" : "text-gray-400"}
        />
        {isHotSpot && (
          <HotSpotBadge
            className={
              isMine ? "bg-white text-gray-900" : "bg-gray-900 text-white"
            }
          />
        )}
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
      <span className={cn("block text-xl font-bold", weekdayClass)}>
        {weekdayFormat.format(date)}
      </span>
      <span className={cn("block text-sm", dateNumClass)}>
        {date.getDate()}
      </span>
    </span>
  );
}

function ProgressBar({
  fill,
  trackClass,
  barClass,
}: {
  fill: number;
  trackClass: string;
  barClass: string;
}) {
  return (
    <span
      className={cn(
        "mt-4 block h-1.5 overflow-hidden rounded-full",
        trackClass,
      )}
    >
      <span
        className={cn("block h-full rounded-full", barClass)}
        style={{ width: `${Math.round(fill * 100)}%` }}
      />
    </span>
  );
}

function ConfirmedCount({
  confirmedCount,
  total,
  countClass,
  emptyClass,
}: {
  confirmedCount: number;
  total: number;
  countClass: string;
  emptyClass: string;
}) {
  return confirmedCount > 0 ? (
    <span className={cn("whitespace-nowrap text-xs", countClass)}>
      {confirmedCount}/{total} confirmed
    </span>
  ) : (
    <span className={cn("whitespace-nowrap text-xs", emptyClass)}>
      No confirmed plans yet
    </span>
  );
}

function HotSpotBadge({ className }: { className: string }) {
  return (
    <span className={cn(hotSpotBadge, className)}>
      Hot spot
      <span aria-hidden="true">🔥</span>
    </span>
  );
}

const headerBase = "block w-full shrink-0 px-4 pb-3 pt-4 text-left";

const iconCircle =
  "flex h-7 w-7 items-center justify-center rounded-full border";

const hotSpotBadge =
  "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide";
