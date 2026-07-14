import CheckIcon from "@/components/icons/CheckIcon";
import MinusIcon from "@/components/icons/MinusIcon";
import PlusIcon from "@/components/icons/PlusIcon";

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
      className={`${headerBase} border-b border-line transition-colors disabled:cursor-not-allowed ${
        isMine
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
        <span
          className={`${iconCircle} border-dashed border-line-faint text-fg-strong`}
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
        trackClass="bg-line-strong"
        barClass={isHotSpot ? "bg-strong" : "bg-fill"}
      />

      <span className="mt-2 flex flex-wrap items-center gap-2">
        <ConfirmedCount
          confirmedCount={confirmedCount}
          total={total}
          countClass="text-fg-muted"
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
  isMine,
  confirmedCount,
  total,
  fill,
  isHotSpot,
}: Omit<DayHeaderProps, "locked" | "myName" | "onToggleMine">) {
  return (
    <div
      className={`${headerBase} border-b ${
        isMine
          ? "border-strong-hover bg-strong text-fg-inverse"
          : "border-line bg-surface-strong text-fg"
      }`}
    >
      <span className="flex items-start justify-between">
        <DayDateLabel
          date={date}
          dateNumClass={isMine ? "text-fg-inverse-muted" : "text-fg-subtle"}
        />
        <span
          className={`${iconCircle} ${
            isMine
              ? "border-fg-inverse text-fg-inverse"
              : "border-strong text-fg"
          }`}
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
        trackClass={isMine ? "bg-white/25" : "bg-line-strong"}
        barClass={isMine ? "bg-white" : isHotSpot ? "bg-strong" : "bg-fill"}
      />

      <span className="mt-2 flex flex-wrap items-center gap-2">
        <ConfirmedCount
          confirmedCount={confirmedCount}
          total={total}
          countClass={isMine ? "text-fg-inverse-muted" : "text-fg-muted"}
          emptyClass={isMine ? "text-fg-inverse-muted" : "text-fg-faint"}
        />
        {isHotSpot && (
          <HotSpotBadge
            className={
              isMine ? "bg-surface text-fg" : "bg-strong text-fg-inverse"
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
      <span className={`block text-xl font-bold ${weekdayClass}`}>
        {weekdayFormat.format(date)}
      </span>
      <span className={`block text-sm ${dateNumClass}`}>{date.getDate()}</span>
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
      className={`mt-4 block h-1.5 overflow-hidden rounded-full ${trackClass}`}
    >
      <span
        className={`block h-full rounded-full ${barClass}`}
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
    <span className={`whitespace-nowrap text-xs ${countClass}`}>
      {confirmedCount}/{total} confirmed
    </span>
  ) : (
    <span className={`whitespace-nowrap text-xs ${emptyClass}`}>
      No confirmed plans yet
    </span>
  );
}

function HotSpotBadge({ className }: { className: string }) {
  return (
    <span className={`${hotSpotBadge} ${className}`}>
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
