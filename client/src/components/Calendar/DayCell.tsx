import { useState } from "react";

import CheckIcon from "@/components/icons/CheckIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import MinusIcon from "@/components/icons/MinusIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import XIcon from "@/components/icons/XIcon";
import type { AttendanceStatus, PersonStatus } from "@/types/calendar/calendar";

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

// Within the "not confirmed" group, maybe comes before no; names sort
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
  /** Whether the logged-in user is confirmed in the office this day. */
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
  // Both groups collapse behind a dropdown. Confirmed is open on first render;
  // the grayed-out "not confirmed" names start collapsed.
  const [showConfirmed, setShowConfirmed] = useState(true);
  const [showOthers, setShowOthers] = useState(false);

  const sorted = [...people].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.name.localeCompare(b.name),
  );
  const confirmed = sorted.filter((person) => person.status === "confirmed");
  const notConfirmed = sorted.filter((person) => person.status !== "confirmed");

  return (
    <div className="flex h-full min-h-0 flex-col">
      {locked ? (
        <ConfirmedHeader
          date={date}
          isMine={isMine}
          confirmedCount={confirmedCount}
          total={total}
          fill={fill}
        />
      ) : (
        /* The whole header block toggles your attendance. Shaded when you're in
           the office this day. */
        <button
          type="button"
          onClick={onToggleMine}
          disabled={!myName}
          aria-pressed={isMine}
          aria-label={
            isMine ? "You're in the office — remove yourself" : "Add yourself"
          }
          className={`block w-full shrink-0 border-b border-gray-200 px-4 pb-3 pt-4 text-left transition-colors disabled:cursor-not-allowed ${
            isMine
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          <span className="flex items-start justify-between">
            <span className="block">
              <span className="block text-xl font-bold text-gray-900">
                {weekdayFormat.format(date)}
              </span>
              <span className="block text-sm text-gray-500">
                {date.getDate()}
              </span>
            </span>

            <span
              className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gray-400 text-gray-700"
              aria-hidden="true"
            >
              {isMine ? (
                <CheckIcon className="h-3.5 w-3.5" />
              ) : (
                <PlusIcon className="h-3.5 w-3.5" />
              )}
            </span>
          </span>

          <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-gray-300">
            <span
              className={`block h-full rounded-full ${
                isHotSpot ? "bg-gray-900" : "bg-gray-500"
              }`}
              style={{ width: `${Math.round(fill * 100)}%` }}
            />
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-2">
            {confirmedCount > 0 ? (
              <span className="whitespace-nowrap text-xs text-gray-600">
                {confirmedCount}/{total} confirmed
              </span>
            ) : (
              <span className="whitespace-nowrap text-xs text-gray-400">
                No confirmed plans yet
              </span>
            )}
            {isHotSpot && (
              <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-gray-900 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-white">
                Hot spot
                <span aria-hidden="true">🔥</span>
              </span>
            )}
          </span>
        </button>
      )}

      {/* Both groups collapse behind a dropdown. */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        {confirmed.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowConfirmed((open) => !open)}
              aria-expanded={showConfirmed}
              className="flex w-full items-center justify-between px-4 pb-1 pt-1.5 text-sm font-bold text-gray-900"
            >
              <span>In the office ({confirmed.length})</span>
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform ${
                  showConfirmed ? "" : "-rotate-90"
                }`}
              />
            </button>

            {showConfirmed && (
              <ul>
                {confirmed.map((person, i) => (
                  <PersonRow
                    key={`${person.name}-${i}`}
                    person={person}
                    myName={myName}
                  />
                ))}
              </ul>
            )}
          </>
        )}

        {notConfirmed.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowOthers((open) => !open)}
              aria-expanded={showOthers}
              className={`flex w-full items-center justify-between px-4 pb-1 text-sm font-bold text-gray-500 ${
                confirmed.length > 0
                  ? "mt-1 border-t border-gray-200 pt-2"
                  : "pt-1.5"
              }`}
            >
              <span>Not confirmed ({notConfirmed.length})</span>
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform ${
                  showOthers ? "" : "-rotate-90"
                }`}
              />
            </button>

            {showOthers && (
              <ul>
                {notConfirmed.map((person, i) => (
                  <PersonRow
                    key={`${person.name}-${i}`}
                    person={person}
                    myName={myName}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Read-only header for a confirmed (locked) week. A day you committed to reads
// as a solid dark card with a check; a day you're out of stays light with a
// muted "minus" marker.
function ConfirmedHeader({
  date,
  isMine,
  confirmedCount,
  total,
  fill,
}: {
  date: Date;
  isMine: boolean;
  confirmedCount: number;
  total: number;
  fill: number;
}) {
  return (
    <div
      className={`block w-full shrink-0 border-b px-4 pb-3 pt-4 text-left ${
        isMine
          ? "border-gray-800 bg-gray-900 text-white"
          : "border-gray-200 bg-gray-200 text-gray-900"
      }`}
    >
      <span className="flex items-start justify-between">
        <span className="block">
          <span className="block text-xl font-bold">
            {weekdayFormat.format(date)}
          </span>
          <span
            className={`block text-sm ${
              isMine ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {date.getDate()}
          </span>
        </span>

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
            isMine ? "border-white text-white" : "border-gray-900 text-gray-900"
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

      <span
        className={`mt-4 block h-1.5 overflow-hidden rounded-full ${
          isMine ? "bg-white/25" : "bg-gray-300"
        }`}
      >
        <span
          className={`block h-full rounded-full ${
            isMine ? "bg-white" : "bg-gray-500"
          }`}
          style={{ width: `${Math.round(fill * 100)}%` }}
        />
      </span>

      <span className="mt-2 flex flex-wrap items-center gap-2">
        {confirmedCount > 0 ? (
          <span
            className={`whitespace-nowrap text-xs ${
              isMine ? "text-gray-200" : "text-gray-600"
            }`}
          >
            {confirmedCount}/{total} confirmed
          </span>
        ) : (
          <span
            className={`whitespace-nowrap text-xs ${
              isMine ? "text-gray-300" : "text-gray-400"
            }`}
          >
            No confirmed plans yet
          </span>
        )}
      </span>
    </div>
  );
}

function PersonRow({
  person,
  myName,
}: {
  person: PersonStatus;
  myName: string;
}) {
  const { name, status } = person;
  const isMe = name === myName;

  return (
    <li className="flex items-center gap-2 px-4 py-1.5">
      <StatusMark status={status} />
      <span
        className={`truncate text-sm ${nameClass(status)} ${
          isMe ? "font-medium" : ""
        }`}
        title={name}
      >
        {name}
      </span>
      {isMe && (
        <span className="shrink-0 text-xs font-medium text-gray-400">
          (you)
        </span>
      )}
    </li>
  );
}

function nameClass(status: AttendanceStatus): string {
  if (status === "confirmed") return "text-gray-900";
  if (status === "maybe") return "text-gray-500";
  return "text-gray-400 line-through";
}

function StatusMark({ status }: { status: AttendanceStatus }) {
  if (status === "confirmed") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-900 text-gray-900">
        <CheckIcon className="h-2.5 w-2.5" />
      </span>
    );
  }

  if (status === "maybe") {
    return (
      <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-gray-400" />
    );
  }

  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-400 text-gray-400">
      <XIcon className="h-2.5 w-2.5" />
    </span>
  );
}
