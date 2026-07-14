import { useState } from "react";

import { PersonRow } from "@/components/Calendar/PersonRow";
import CheckIcon from "@/components/icons/CheckIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import XIcon from "@/components/icons/XIcon";
import type { AttendanceStatus, PersonStatus } from "@/types/calendar/calendar";

interface AttendanceGroupProps {
  title: string;
  /** Color for the group heading text. */
  titleClass: string;
  /** Status this group represents, driving the icon to the left of the title. */
  status: AttendanceStatus;
  people: PersonStatus[];
  /** Display name of the logged-in user, highlighted in the list. */
  myName: string;
  /** Whether the group starts expanded. */
  defaultOpen: boolean;
  /** Adds a top divider + spacing; true for every group after the first. */
  divided: boolean;
  /** Whether the week is confirmed (locked); fills the title icons with the
      dark scheme used by the confirmed day headers. */
  locked: boolean;
}

export function AttendanceGroup({
  title,
  titleClass,
  status,
  people,
  myName,
  defaultOpen,
  divided,
  locked,
}: AttendanceGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`${groupHeader} ${titleClass} ${
          divided ? "mt-1 border-t border-line pt-2" : "pt-1.5"
        }`}
      >
        <span className="flex items-center gap-2">
          <TitleMark status={status} locked={locked} />
          <span>
            {title} ({people.length})
          </span>
        </span>
        <ChevronDownIcon
          className={`h-3 w-3 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>

      {open && (
        <ul>
          {people.map((person) => (
            <PersonRow key={person.name} person={person} myName={myName} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** The status icon shown to the left of a group title. Outlined while planning;
    filled with a dark scheme once the week is confirmed. */
function TitleMark({
  status,
  locked,
}: {
  status: AttendanceStatus;
  locked: boolean;
}) {
  if (status === "maybe") {
    // Unlocked: a hollow dashed circle. Locked: fill it dark to match the
    // confirmed day headers, keeping a white dashed ring so it still reads as
    // the "planning" mark instead of vanishing into a solid dot.
    return locked ? (
      <span className={`${titleMark} bg-strong`}>
        <span className="h-2 w-2 rounded-full border border-dashed border-fg-inverse" />
      </span>
    ) : (
      <span className="h-4 w-4 shrink-0 rounded-full border border-dashed border-line-faint" />
    );
  }

  const Icon = status === "confirmed" ? CheckIcon : XIcon;
  const outlineClass =
    status === "confirmed"
      ? "border-strong text-fg"
      : "border-line-faint text-fg-faint";

  return (
    <span
      className={`${titleMark} ${
        locked ? "bg-strong text-fg-inverse" : `border ${outlineClass}`
      }`}
    >
      <Icon className="h-2.5 w-2.5" />
    </span>
  );
}

const groupHeader =
  "flex w-full items-center justify-between px-4 pb-1 text-sm font-bold";

const titleMark =
  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full";
