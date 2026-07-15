import { useState } from "react";
import type { ReactNode } from "react";

import { StatusIcon } from "@/components/Calendar/StatusIcon";
import type {
  StatusMark,
  StatusVariant,
} from "@/components/Calendar/StatusIcon";
import NudgeIcon from "@/components/icons/NudgeIcon";
import type { PersonStatus } from "@/types/calendar/calendar";

interface DayRosterProps {
  /** The full office roster with each person's status for this day. */
  people: PersonStatus[];
  /** Display name of the logged-in user, highlighted in the list. */
  myName: string;
}

type Tab = "in" | "out";

/** Replaces the per-status dropdowns with a two-way toggle: one side lists
    everyone in the office (split into confirmed vs. still-planning), the other
    lists everyone who's out. */
export function DayRoster({ people, myName }: DayRosterProps) {
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

  const inCount = confirmed.length + planning.length;
  const outCount = confirmedOut.length + plannedOut.length;

  const [tab, setTab] = useState<Tab>("in");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
      <div
        role="tablist"
        className="mb-4 flex rounded-full bg-surface-sunken p-1 text-xs font-bold"
      >
        <TabButton active={tab === "in"} onClick={() => setTab("in")}>
          {inCount} in office
        </TabButton>
        <TabButton active={tab === "out"} onClick={() => setTab("out")}>
          {outCount} not in office
        </TabButton>
      </div>

      {tab === "in" ? (
        inCount > 0 ? (
          <div className="space-y-4">
            {confirmed.length > 0 && (
              <RosterSection title="Confirmed in office">
                {confirmed.map((person) => (
                  <RosterRow
                    key={person.name}
                    person={person}
                    myName={myName}
                    mark="confirmed-yes"
                    variant="solid"
                  />
                ))}
              </RosterSection>
            )}
            {planning.length > 0 && (
              <RosterSection title="Planning to be in office">
                {planning.map((person) => (
                  <RosterRow
                    key={person.name}
                    person={person}
                    myName={myName}
                    mark="confirmed-yes"
                    variant="outline"
                    muted
                    nudgeable
                  />
                ))}
              </RosterSection>
            )}
          </div>
        ) : (
          <EmptyState>No one's in the office yet.</EmptyState>
        )
      ) : outCount > 0 ? (
        <div className="space-y-4">
          {confirmedOut.length > 0 && (
            <RosterSection title="Confirmed out">
              {confirmedOut.map((person) => (
                <RosterRow
                  key={person.name}
                  person={person}
                  myName={myName}
                  mark="confirmed-no"
                  variant="solid"
                />
              ))}
            </RosterSection>
          )}
          {plannedOut.length > 0 && (
            <RosterSection title="Planning to be out">
              {plannedOut.map((person) => (
                <RosterRow
                  key={person.name}
                  person={person}
                  myName={myName}
                  mark="planning-no"
                  variant="outline"
                  muted
                  nudgeable
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
      className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
        active ? "bg-strong text-fg-inverse" : "text-fg-subtle hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function RosterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-bold text-fg-subtle">{title}</h3>
      <ul>{children}</ul>
    </div>
  );
}

function RosterRow({
  person,
  myName,
  mark,
  variant,
  muted = false,
  nudgeable = false,
}: {
  person: PersonStatus;
  myName: string;
  mark: StatusMark;
  variant: StatusVariant;
  muted?: boolean;
  nudgeable?: boolean;
}) {
  const isMe = person.name === myName;

  return (
    <li className="flex items-center gap-2 py-1.5">
      <StatusIcon mark={mark} variant={variant} size="md" />
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          muted ? "text-fg-subtle" : "text-fg"
        } ${isMe ? "font-medium" : ""}`}
        title={person.name}
      >
        {person.name}
      </span>
      {isMe && (
        <span className="shrink-0 text-xs font-medium text-fg-faint">
          (you)
        </span>
      )}
      {nudgeable && !isMe && (
        <button
          type="button"
          aria-label={`Nudge ${person.name}`}
          className="flex shrink-0 items-center gap-1 rounded-full border border-line-strong px-2 py-0.5 text-xs font-medium text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <NudgeIcon className="h-3.5 w-3.5" />
          Nudge
        </button>
      )}
    </li>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-fg-faint">{children}</p>;
}
