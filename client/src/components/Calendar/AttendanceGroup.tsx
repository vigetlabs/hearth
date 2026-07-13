import { useState } from "react";

import { PersonRow } from "@/components/Calendar/PersonRow";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import type { PersonStatus } from "@/types/calendar/calendar";

interface AttendanceGroupProps {
  title: string;
  /** Color for the group heading text. */
  titleClass: string;
  people: PersonStatus[];
  /** Display name of the logged-in user, highlighted in the list. */
  myName: string;
  /** Whether the group starts expanded. */
  defaultOpen: boolean;
  /** Adds a top divider + spacing; true for every group after the first. */
  divided: boolean;
}

export function AttendanceGroup({
  title,
  titleClass,
  people,
  myName,
  defaultOpen,
  divided,
}: AttendanceGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`${groupHeader} ${titleClass} ${
          divided ? "mt-1 border-t border-gray-200 pt-2" : "pt-1.5"
        }`}
      >
        <span>
          {title} ({people.length})
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

const groupHeader =
  "flex w-full items-center justify-between px-4 pb-1 text-sm font-bold";
