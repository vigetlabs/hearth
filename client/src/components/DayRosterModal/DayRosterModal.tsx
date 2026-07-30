import { Dialog } from "radix-ui";

import { StatusIcon } from "@/components/Calendar/StatusIcon";
import type {
  StatusMark,
  StatusVariant,
} from "@/components/Calendar/StatusIcon";
import XIcon from "@/components/icons/XIcon";
import type { AttendanceStatus, RosterUser } from "@/types/calendar/calendar";

// "Wednesday, Jul 1" — weekday spelled out, month abbreviated.
const titleDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
});

/** Which of the two in-office roster sections the modal is expanding. */
export type RosterSectionKey = "confirmed-in" | "planning-in";

/** Mirrors the matching section in `DayRoster` — same status filter, heading
    and icon treatment, so the modal reads as the same list made bigger. */
const SECTIONS: Record<
  RosterSectionKey,
  {
    status: AttendanceStatus;
    heading: string;
    description: string;
    empty: string;
    mark: StatusMark;
    variant: StatusVariant;
    iconClassName: string;
  }
> = {
  "confirmed-in": {
    status: "confirmed-yes",
    heading: "Confirmed In",
    description: "Everyone below is confirmed in for this day.",
    empty: "No one's confirmed yet.",
    mark: "confirmed-yes",
    variant: "solid",
    iconClassName: "border-fg bg-fg",
  },
  "planning-in": {
    status: "planning-yes",
    heading: "Planning to Come In",
    description: "Everyone below is planning to come in this day.",
    empty: "No one's planning to come in yet.",
    mark: "confirmed-yes",
    variant: "outline",
    iconClassName: "border-strong text-fg",
  },
};

interface DayRosterModalProps {
  open: boolean;
  /** The day being listed; formatted into the title next to the office name. */
  date: Date;
  /** Office whose roster this is, e.g. "Boulder". */
  officeName: string;
  /** Which section to list. The modal applies the status filter itself. */
  section: RosterSectionKey;
  /** The full day roster — the modal picks out the section's people itself. */
  rosterUsers: RosterUser[];
  /** Called for every dismissal: the X, the Done button, Escape, outside click. */
  onClose: () => void;
}

/**
 * The full list of everyone in one of a day's in-office sections — the overflow
 * view behind a roster's "View all" chip, where the inline roster is squeezed
 * into a narrow day column.
 *
 * The panel is a flex column capped at 85% of the viewport: header and footer
 * hold their size and only the name list scrolls, so a short roster shrinks the
 * modal to fit and a long one scrolls inside it.
 */
export default function DayRosterModal({
  open,
  date,
  officeName,
  section,
  rosterUsers,
  onClose,
}: DayRosterModalProps) {
  const config = SECTIONS[section];

  // Deliberately flat: this is the "who is in this bucket" list, not the
  // confirmed-vs-planning breakdown DayRoster shows.
  const people = rosterUsers
    .filter((rosterUser) => rosterUser.status === config.status)
    .sort((a, b) => a.name.localeCompare(b.name));

  function handleOpenChange(next: boolean) {
    if (!next) {
      onClose();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-white/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-40 flex max-h-[85vh] w-full max-w-[22.5rem] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[1.25rem] bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.18)] focus:outline-none">
          {/* Header holds its height so the count stays visible while scrolling. */}
          <div className="shrink-0 px-7 pt-7">
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="text-xl font-bold text-fg">
                {titleDateFormat.format(date)} · {officeName}
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close"
                className="-mr-1.5 -mt-0.5 shrink-0 rounded-md p-1.5 text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg focus:outline-none"
              >
                <XIcon className="h-3.5 w-3.5" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="mt-1.5 text-sm text-fg-muted">
              {config.description}
            </Dialog.Description>
            <h3 className="mt-5 text-xs font-semibold text-fg">
              {config.heading} ({people.length})
            </h3>
          </div>

          {/* The only region that scrolls. `min-h-0` is what lets it shrink
              below its content height instead of stretching the panel. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pt-3">
            {people.length > 0 ? (
              <ul className="space-y-2.5">
                {people.map((person) => (
                  <li key={person.userId} className="flex items-center gap-2.5">
                    <StatusIcon
                      mark={config.mark}
                      variant={config.variant}
                      size="md"
                      className={`h-5 w-5 ${config.iconClassName}`}
                    />
                    <span className="flex min-w-0 flex-1 items-center gap-1">
                      <span
                        className="min-w-0 truncate text-sm font-medium text-fg"
                        title={person.name}
                      >
                        {person.name}
                      </span>
                      {person.isVisitor && (
                        <span
                          className="shrink-0 text-fg-subtle"
                          title="Visiting from another office"
                          aria-hidden="true"
                        >
                          📣
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-faint">{config.empty}</p>
            )}
          </div>

          <div className="flex shrink-0 justify-end px-7 pb-7 pt-5">
            <Dialog.Close className="rounded-lg bg-fill px-6 py-2.5 text-sm font-semibold text-fg-inverse transition-colors hover:bg-fill-hover focus:outline-none">
              Done
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
