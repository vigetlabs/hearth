import { useState } from "react";
import type { ReactNode } from "react";

import { StatusIcon } from "@/components/Calendar/StatusIcon";
import type {
  StatusMark,
  StatusVariant,
} from "@/components/Calendar/StatusIcon";
import NudgeIcon from "@/components/icons/NudgeIcon";
import type { PersonStatus } from "@/types/calendar/calendar";
import { isFuture } from "@/util/dates/date";
import { cn } from "@/util/cn";

interface DayRosterProps {
  /** The day this roster is for; nudging is only allowed for future days. */
  date: Date;
  /** The full office roster with each person's status for this day. */
  people: PersonStatus[];
  myUserId: number;
}

type Tab = "in" | "out";

/** Replaces the per-status dropdowns with a two-way toggle: one side lists
    everyone in the office (split into confirmed vs. still-planning), the other
    lists everyone who's out. */
export function DayRoster({ date, people, myUserId }: DayRosterProps) {
  // Only nudge for upcoming days — today and past days are too late.
  const canNudge = isFuture(date);

  const confirmed = people
    .filter((person) => person.status === "confirmed-yes")
    .sort(byName);
  const planning = people
    .filter((person) => person.status === "planning-yes")
    .sort(byName);
  const confirmedOut = people
    .filter((person) => person.status === "confirmed-no")
    .sort(byName);
  const plannedOut = people
    .filter((person) => person.status === "planning-no")
    .sort(byName);

  const confirmedInCount = confirmed.length;
  const planningInCount = planning.length;
  const confirmedOutCount = confirmedOut.length;
  const planningOutCount = plannedOut.length;

  const [tab, setTab] = useState<Tab>("in");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div
        role="tablist"
        className="mx-auto mb-4 flex w-fit rounded-full bg-surface-muted p-1 text-xs font-bold"
      >
        <TabButton active={tab === "in"} onClick={() => setTab("in")}>
          In Office
        </TabButton>
        <TabButton active={tab === "out"} onClick={() => setTab("out")}>
          Not in Office
        </TabButton>
      </div>

      {tab === "in" ? (
        confirmedInCount > 0 || planningInCount > 0 ? (
          <div className="space-y-4">
            {confirmed.length > 0 && (
              <RosterSection title="Confirmed In" count={confirmedInCount}>
                {confirmed.map((person) => (
                  <RosterRow
                    key={person.userId}
                    person={person}
                    myUserId={myUserId}
                    mark="confirmed-yes"
                    variant="solid"
                  />
                ))}
              </RosterSection>
            )}
            {planning.length > 0 && (
              <RosterSection
                title="Planning to Come In"
                count={planningInCount}
              >
                {planning.map((person) => (
                  <RosterRow
                    key={person.userId}
                    person={person}
                    myUserId={myUserId}
                    mark="confirmed-yes"
                    variant="outline"
                    muted
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
            <RosterSection title="Confirmed out" count={confirmedOutCount}>
              {confirmedOut.map((person) => (
                <RosterRow
                  key={person.userId}
                  person={person}
                  myUserId={myUserId}
                  mark="confirmed-no"
                  variant="solid"
                />
              ))}
            </RosterSection>
          )}
          {plannedOut.length > 0 && (
            <RosterSection title="Planning to be out" count={planningOutCount}>
              {plannedOut.map((person) => (
                <RosterRow
                  key={person.userId}
                  person={person}
                  myUserId={myUserId}
                  mark="planning-no"
                  variant="outline"
                  muted
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

const byName = (a: PersonStatus, b: PersonStatus) =>
  a.name.localeCompare(b.name);

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
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
        active ? "bg-strong text-fg-inverse" : "text-fg-subtle hover:text-fg",
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
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-bold text-fg">
        {title} ({count})
      </h3>
      <ul>{children}</ul>
    </div>
  );
}

function RosterRow({
  person,
  myUserId,
  mark,
  variant,
  muted = false,
  nudgeable = false,
}: {
  person: PersonStatus;
  myUserId: number;
  mark: StatusMark;
  variant: StatusVariant;
  muted?: boolean;
  nudgeable?: boolean;
}) {
  const isMe = person.userId === myUserId;
  const isPending =
    person.status === "planning-yes" || person.status === "planning-no";

  return (
    <li className="flex items-center gap-2 py-1.5">
      <StatusIcon mark={mark} variant={variant} size="md" />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          muted ? "text-fg-subtle" : "text-fg",
          isMe && "font-medium",
        )}
        title={person.name}
      >
        {person.name}
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
      {nudgeable && !isMe && (
        <button
          type="button"
          aria-label={`Nudge ${person.name}`}
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
