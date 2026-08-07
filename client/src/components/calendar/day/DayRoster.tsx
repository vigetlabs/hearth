import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { StatusIcon } from "@/components/icons/StatusIcon";
import type { StatusMark, StatusVariant } from "@/components/icons/StatusIcon";
import NudgeIcon from "@/components/icons/NudgeIcon";
import { isInOffice } from "@/types/calendar/calendar";
import { isFuture } from "@/util/dates/date";
import { cn } from "@/util/cn";
import type { CalendarScheduleEntry } from "@/types/calendar/schedule/weekSchedule";
import { userDisplayName } from "@/util/auth/displayName";

// Nudge feature is built but hidden for now. Flip to true to re-enable the
// Nudge button next to roster names.
const SHOW_NUDGE_BUTTON = false;

interface DayRosterProps {
  /** The day this roster is for; nudging is only allowed for future days. */
  date: Date;
  /** Id of the office currently being viewed. Switching offices resets the tab
      back to "In Office". */
  officeId: number;
  /** The full office roster with each person's status for this day. */
  entries: CalendarScheduleEntry[];
  myUserId: number;
  /** Whether the week is confirmed (locked). Used to flip the tab to the user's
      own pick at the moment they confirm. */
  locked: boolean;
}

type Tab = "in" | "out";

/** Replaces the per-status dropdowns with a two-way toggle: one side lists
    everyone in the office (split into confirmed vs. still-planning), the other
    lists everyone who's out. */
export function DayRoster({
  date,
  officeId,
  entries,
  myUserId,
  locked,
}: DayRosterProps) {
  // Only nudge for upcoming days — today and past days are too late.
  const canNudge = isFuture(date);

  const meFirst = byMeThenName(myUserId);

  const confirmed = entries
    .filter((entry) => entry.status === "confirmed-yes")
    .sort(meFirst);

  const planning = entries.filter((entry) => entry.status === "planning-yes");

  const confirmedOut = entries
    .filter(
      (entry) =>
        entry.status === "confirmed-no" ||
        entry.status === "confirmed-elsewhere",
    )
    .sort(meFirst);

  const plannedOut = entries.filter((entry) => entry.status === "planning-no");

  const confirmedInCount = confirmed.length;
  const planningInCount = planning.length;
  const confirmedOutCount = confirmedOut.length;
  const planningOutCount = plannedOut.length;

  // The tab always starts on "In Office". It auto-switches in two cases:
  //   * Switching offices snaps it back to "In Office" (see the effect below).
  //   * Confirming the week flips it to whichever side matches the user's own
  //     pick for this day.
  // Otherwise it stays wherever the user leaves it.
  const [tab, setTab] = useState<Tab>("in");

  const amInOffice = entries.some(
    (entry) => entry.user.id === myUserId && isInOffice(entry.status),
  );

  const wasLocked = useRef(locked);
  const prevOfficeId = useRef(officeId);
  // Whether we should keep the tab mirrored to the user's own pick. We enter
  // this mode on the confirm (locked false -> true) and leave it as soon as the
  // user clicks a tab, or the week is unlocked again. We follow the pick across
  // renders rather than reading it once, because confirming rebuilds the roster
  // from two independent queries: the "confirmed" flag can land a frame before
  // the visit record, so the user momentarily reads as out before showing in.
  const followMyPick = useRef(false);

  useEffect(() => {
    // Switching offices always snaps back to "In Office" and drops any
    // confirm-mirroring — you're looking at a fresh office now. Handled first so
    // it wins even when the new office's locked/attendance change in the same
    // render; syncing wasLocked here keeps the confirm branch from mistaking the
    // office change for a fresh confirm on the next run.
    if (officeId !== prevOfficeId.current) {
      prevOfficeId.current = officeId;
      wasLocked.current = locked;
      followMyPick.current = false;
      setTab("in");
      return;
    }

    if (locked && !wasLocked.current) {
      followMyPick.current = true;
    } else if (!locked) {
      followMyPick.current = false;
    }
    wasLocked.current = locked;

    if (locked && followMyPick.current) {
      setTab(amInOffice ? "in" : "out");
    }
  }, [officeId, locked, amInOffice]);

  function selectTab(next: Tab): void {
    // A manual pick takes over — stop mirroring the confirmed status.
    followMyPick.current = false;
    setTab(next);
  }

  return (
    <div
      data-tour="day-roster"
      className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
    >
      <div
        role="tablist"
        className="mx-auto mb-4 flex w-fit rounded-full bg-surface-muted p-1 text-xs font-bold"
      >
        <TabButton
          active={tab === "in"}
          onClick={() => selectTab("in")}
          activeClassName="bg-in-office text-fg-inverse"
        >
          In Office
        </TabButton>
        <TabButton
          active={tab === "out"}
          onClick={() => selectTab("out")}
          activeClassName="bg-out-office text-fg-inverse"
        >
          Not in Office
        </TabButton>
      </div>

      {tab === "in" ? (
        confirmedInCount > 0 || planningInCount > 0 ? (
          <div className="space-y-4">
            {confirmed.length > 0 && (
              <RosterSection title="Confirmed In" count={confirmedInCount}>
                {confirmed.map((entry) => (
                  <RosterRow
                    key={entry.user.id}
                    entry={entry}
                    myUserId={myUserId}
                    mark="confirmed-yes"
                    variant="solid"
                    iconClassName="border-fg bg-fg"
                  />
                ))}
              </RosterSection>
            )}
            {planning.length > 0 && (
              <RosterSection
                title="Planning to Come In"
                count={planningInCount}
              >
                {planning.map((entry) => (
                  <RosterRow
                    key={entry.user.id}
                    entry={entry}
                    myUserId={myUserId}
                    mark="confirmed-yes"
                    variant="outline"
                    iconClassName="border-strong text-fg"
                    nudgeable={canNudge}
                  />
                ))}
              </RosterSection>
            )}
          </div>
        ) : (
          <EmptyState>No one's in the office yet.</EmptyState>
        )
      ) : confirmedOutCount > 0 || planningOutCount > 0 ? (
        <div className="space-y-4">
          {confirmedOut.length > 0 && (
            <RosterSection title="Confirmed Out" count={confirmedOutCount}>
              {confirmedOut.map((entry) => (
                <RosterRow
                  key={entry.user.id}
                  entry={entry}
                  myUserId={myUserId}
                  mark="confirmed-no"
                  variant="solid"
                  iconClassName="border-[#77685d] bg-[#77685d]"
                />
              ))}
            </RosterSection>
          )}
          {plannedOut.length > 0 && (
            <RosterSection
              title="Planning Not to Come In"
              count={planningOutCount}
              titleClassName="text-fg-muted"
            >
              {plannedOut.map((entry) => (
                <RosterRow
                  key={entry.user.id}
                  entry={entry}
                  myUserId={myUserId}
                  mark="planning-no"
                  variant="outline"
                  iconClassName="border-fg text-fg"
                  nudgeable={canNudge}
                />
              ))}
            </RosterSection>
          )}
        </div>
      ) : (
        <EmptyState>Everyone's in the office.</EmptyState>
      )}
    </div>
  );
}

// Floats the current user to the top of their section; everyone else keeps
// their existing name order.
const byMeThenName =
  (myUserId: number) =>
  (a: CalendarScheduleEntry, b: CalendarScheduleEntry) => {
    if (a.user.id === myUserId) return -1;
    if (b.user.id === myUserId) return 1;
    return a.user.first_name.localeCompare(b.user.first_name);
  };

function TabButton({
  active,
  onClick,
  activeClassName,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClassName: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full px-2.5 py-0.5 transition-colors",
        active ? activeClassName : "text-fg-subtle hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function RosterSection({
  title,
  count,
  children,
  titleClassName,
}: {
  title: string;
  count: number;
  children: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div>
      <h3
        className={cn("mb-1.5 text-xs font-semibold text-fg", titleClassName)}
      >
        {title} ({count})
      </h3>
      <ul>{children}</ul>
    </div>
  );
}

function RosterRow({
  entry,
  myUserId,
  mark,
  variant,
  iconClassName,
  nudgeable = false,
}: {
  entry: CalendarScheduleEntry;
  myUserId: number;
  mark: StatusMark;
  variant: StatusVariant;
  iconClassName?: string;
  nudgeable?: boolean;
}) {
  const isMe = entry.user.id === myUserId;
  const isPending =
    entry.status === "planning-yes" || entry.status === "planning-no";

  const displayName = userDisplayName(entry.user);

  return (
    <li className="flex items-center gap-2 py-1.5">
      <StatusIcon
        mark={mark}
        variant={variant}
        size="sm"
        className={iconClassName}
      />
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span
          className="min-w-0 truncate text-sm font-semibold text-fg"
          title={displayName}
        >
          {displayName}
        </span>
        {entry.isVisitor && (
          <span
            className="shrink-0 text-fg-subtle"
            title="Visiting from another office"
            aria-hidden="true"
          >
            📣
          </span>
        )}
      </span>
      {isMe &&
        (isPending ? (
          <span className="shrink-0 rounded-full bg-surface-muted px-1.5 py-0.5 text-[0.5625rem] font-semibold text-fg-subtle">
            Pending
          </span>
        ) : (
          <span className="shrink-0 text-xs font-medium text-fg-faint">
            (you)
          </span>
        ))}
      {/* Nudge button hidden for now — keep the code, just don't render it. */}
      {SHOW_NUDGE_BUTTON && nudgeable && !isMe && (
        <button
          type="button"
          aria-label={`Nudge ${displayName}`}
          className="flex shrink-0 items-center gap-0.5 rounded-full border border-line-strong px-1.5 py-px text-[0.625rem] font-medium text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <NudgeIcon className="h-3 w-3" />
          Nudge
        </button>
      )}
    </li>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-fg-faint">{children}</p>;
}
