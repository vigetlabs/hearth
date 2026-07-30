import { useState } from "react";
import { RadioGroup } from "radix-ui";

import { DayRoster } from "@/components/Calendar/DayRoster";
import Loader from "@/components/Loader/Loader";
import OfficeItem from "@/components/OfficeItem/OfficeItem";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import DayRosterModal from "@/components/DayRosterModal/DayRosterModal";
import MoreAttendeesChip from "@/components/MoreAttendeesChip/MoreAttendeesChip";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import ErrorPage from "@/pages/ErrorPage/ErrorPage";
import {
  StatusIcon,
  type StatusMark,
  type StatusVariant,
} from "@/components/Calendar/StatusIcon";
import type { Office } from "@/types/api/offices";
import type { AttendanceStatus, RosterUser } from "@/types/calendar/calendar";

import { useOfficePresence } from "@/util/cable/useOfficePresence";

// A dev-only gallery for eyeballing components in isolation. Add a <Demo> block
// per component/state you want to see. This page is only mounted in dev (see the
// route in routes/router.ts), so it never ships to production.

function Demo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-8">
      <h2 className="mb-4 font-mono text-sm text-fg-muted">{title}</h2>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </section>
  );
}

const SAMPLE_OFFICES: Office[] = [
  { id: 1, name: "Falls Church", emoji: "🏢" } as Office,
  { id: 2, name: "Durham", emoji: "🌳" } as Office,
  { id: 3, name: "Remote", emoji: "🏠" } as Office,
];

const STATUS_MARKS: StatusMark[] = [
  "confirmed-yes",
  "planning-yes",
  "planning-no",
  "confirmed-no",
  "add",
];

const STATUS_VARIANTS: StatusVariant[] = ["outline", "solid", "dashed"];

// Wednesday, Jul 1 — the day in the DayRosterModal design.
const SAMPLE_DATE = new Date(2026, 6, 1);

const roster = (names: string[], status: AttendanceStatus): RosterUser[] =>
  names.map((name, index) => ({
    userId: index + 1,
    name,
    status,
    isVisitor: false,
  }));

const SAMPLE_NAMES = [
  "Kate B",
  "Marcus J",
  "Elena V",
  "Dana W",
  "Owen T",
  "Priya R",
  "Jackson F",
];

// Short enough that the modal shrinks to fit — no scrolling.
const SAMPLE_ROSTER = roster(SAMPLE_NAMES, "confirmed-yes");

// Same names on the other in-office status, to check the "Planning to Come In"
// heading and outlined icons.
const SAMPLE_PLANNING_ROSTER = roster(SAMPLE_NAMES, "planning-yes");

// Long enough to overflow the panel and hand the middle region a scrollbar.
const SAMPLE_LONG_ROSTER = roster(
  Array.from({ length: 40 }, (_, index) => `Person Number ${index + 1}`),
  "confirmed-yes",
);

// Names for the day-column fitting demo. Past the end of the pool they repeat
// with a number appended, so any count you dial in produces distinct rows.
const NAME_POOL = [
  "Kate B",
  "Marcus J",
  "Elena V",
  "Dana W",
  "Owen T",
  "Priya R",
  "Jackson F",
  "Nina S",
  "Theo A",
  "Ruth M",
  "Gabe L",
  "Ines C",
];

function person(index: number, status: AttendanceStatus): RosterUser {
  const pass = Math.floor(index / NAME_POOL.length);

  return {
    userId: index + 1,
    name:
      NAME_POOL[index % NAME_POOL.length] + (pass > 0 ? ` ${pass + 1}` : ""),
    status,
    isVisitor: false,
  };
}

/** A day's worth of in-office people, split between the two sections. */
const mixedRoster = (
  confirmedCount: number,
  planningCount: number,
): RosterUser[] => [
  ...Array.from({ length: confirmedCount }, (_, index) =>
    person(index, "confirmed-yes"),
  ),
  ...Array.from({ length: planningCount }, (_, index) =>
    person(confirmedCount + index, "planning-yes"),
  ),
];

/** Label + [-] [n] [+] stepper, for dialling a section's headcount. */
function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const step = (delta: number) => () => onChange(Math.max(0, value + delta));

  return (
    <label className="flex items-center gap-2 text-sm text-fg">
      <span className="w-36">{label}</span>
      <button
        type="button"
        onClick={step(-1)}
        className="h-7 w-7 rounded-md border border-line text-fg-muted hover:bg-surface-sunken"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
        className="w-14 rounded-md border border-line px-2 py-1 text-center text-sm"
      />
      <button
        type="button"
        onClick={step(1)}
        className="h-7 w-7 rounded-md border border-line text-fg-muted hover:bg-surface-sunken"
      >
        +
      </button>
    </label>
  );
}

export default function SandboxPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenWarning, setModalOpenWarning] = useState(false);
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [planningModalOpen, setPlanningModalOpen] = useState(false);
  const [longRosterModalOpen, setLongRosterModalOpen] = useState(false);

  // Day-column fitting controls.
  const [confirmedCount, setConfirmedCount] = useState(10);
  const [planningCount, setPlanningCount] = useState(1);
  const [cellHeight, setCellHeight] = useState(420);

  const selectedOfficeId = 1;
  const presentUsers = useOfficePresence(selectedOfficeId);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-fg">Component Sandbox</h1>
      <p className="mb-8 text-sm text-fg-muted">
        Dev-only. Drop components here to see them without wiring up real data.
      </p>

      <Demo title="Loader">
        <Loader />
        <Loader size="h-8 w-8" />
        <Loader size="h-12 w-12" />
      </Demo>

      <Demo title="StatusIcon — marks × variants (size lg)">
        {STATUS_VARIANTS.map((variant) => (
          <div key={variant} className="flex items-center gap-3">
            <span className="w-16 font-mono text-xs text-fg-muted">
              {variant}
            </span>
            {STATUS_MARKS.map((mark) => (
              <StatusIcon key={mark} mark={mark} variant={variant} size="lg" />
            ))}
          </div>
        ))}
      </Demo>

      <Demo title="OfficeItem (inside a RadioGroup)">
        <RadioGroup.Root className="grid w-full max-w-md grid-cols-3 gap-4">
          {SAMPLE_OFFICES.map((office) => (
            <OfficeItem key={office.id} office={office} className="" />
          ))}
        </RadioGroup.Root>
      </Demo>

      <Demo title="MoreAttendeesChip">
        <MoreAttendeesChip count={3} />
        <MoreAttendeesChip count={12} />
        <MoreAttendeesChip count={148} />
        <MoreAttendeesChip label="View all" />
      </Demo>

      <Demo title="DayRosterModal">
        <MoreAttendeesChip
          label="View all (7 confirmed — fits)"
          onClick={() => setRosterModalOpen(true)}
        />
        <DayRosterModal
          open={rosterModalOpen}
          date={SAMPLE_DATE}
          officeName="Boulder"
          section="confirmed-in"
          rosterUsers={SAMPLE_ROSTER}
          onClose={() => setRosterModalOpen(false)}
        />
        <MoreAttendeesChip
          label="View all (7 planning)"
          onClick={() => setPlanningModalOpen(true)}
        />
        <DayRosterModal
          open={planningModalOpen}
          date={SAMPLE_DATE}
          officeName="Boulder"
          section="planning-in"
          rosterUsers={SAMPLE_PLANNING_ROSTER}
          onClose={() => setPlanningModalOpen(false)}
        />
        <MoreAttendeesChip
          label="View all (40 confirmed — scrolls)"
          onClick={() => setLongRosterModalOpen(true)}
        />
        <DayRosterModal
          open={longRosterModalOpen}
          date={SAMPLE_DATE}
          officeName="Boulder"
          section="confirmed-in"
          rosterUsers={SAMPLE_LONG_ROSTER}
          onClose={() => setLongRosterModalOpen(false)}
        />
      </Demo>

      <Demo title="DayRoster — in-office sections sharing a fixed-height column">
        <div className="w-full">
          <p className="mb-4 max-w-prose text-sm text-fg-muted">
            The column is sized like a real day cell (a fifth of the calendar
            grid). Dial the two headcounts and the column height: the section
            asking for less room is satisfied first, and whatever a section
            can't show collapses into its own "+N more" chip. Try 10 confirmed /
            1 planning, then add a second planning person.
          </p>

          <div className="flex flex-wrap items-start gap-10">
            <div className="flex flex-col gap-3">
              <Stepper
                label="Confirmed In"
                value={confirmedCount}
                onChange={setConfirmedCount}
              />
              <Stepper
                label="Planning to Come In"
                value={planningCount}
                onChange={setPlanningCount}
              />
              <label className="flex items-center gap-2 text-sm text-fg">
                <span className="w-36">Column height</span>
                <input
                  type="range"
                  min={200}
                  max={800}
                  step={10}
                  value={cellHeight}
                  onChange={(event) =>
                    setCellHeight(Number(event.target.value))
                  }
                  className="w-48"
                />
                <span className="w-16 font-mono text-xs text-fg-muted">
                  {cellHeight}px
                </span>
              </label>
            </div>

            {/* Stands in for a DayCell: fixed height, one column wide, with a
                header block above the roster like the real thing. */}
            <div
              className="flex w-[15rem] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-line"
              style={{ height: `${cellHeight}px` }}
            >
              <div className="shrink-0 border-b-2 border-line px-4 py-3 text-center text-xs font-semibold text-fg-muted">
                (DayHeader)
              </div>
              <DayRoster
                date={SAMPLE_DATE}
                officeId={1}
                officeName="Boulder"
                rosterUsers={mixedRoster(confirmedCount, planningCount)}
                myUserId={1}
                locked={false}
              />
            </div>
          </div>
        </div>
      </Demo>

      <Demo title="ConfirmationModal">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-strong px-4 py-2 text-sm font-medium text-fg-inverse transition-colors hover:bg-strong-hover"
        >
          Open modal
        </button>
        <ConfirmationModal
          open={modalOpen}
          title="Your default office is Boulder"
          description="Are you sure you want to schedule an in-person visit to Falls Church?"
          confirmLabel="Yes"
          cancelLabel="Go back"
          onConfirm={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
        <button
          type="button"
          onClick={() => setModalOpenWarning(true)}
          className="rounded-lg bg-strong px-4 py-2 text-sm font-medium text-fg-inverse transition-colors hover:bg-strong-hover"
        >
          Open modal (warning style/destructive action)
        </button>
        <ConfirmationModal
          open={modalOpenWarning}
          title="Your default office is Boulder"
          description="Are you sure you want to schedule an in-person visit to Falls Church?"
          confirmLabel="Yes"
          cancelLabel="Go back"
          destructive
          onConfirm={() => setModalOpenWarning(false)}
          onCancel={() => setModalOpenWarning(false)}
        />
      </Demo>

      <Demo title="NotFoundPage (404 — route does not exist)">
        <div className="flex h-[32rem] w-full overflow-hidden rounded-xl border border-line">
          <NotFoundPage />
        </div>
      </Demo>

      <Demo title="ErrorPage (generic — something went wrong)">
        <div className="flex h-[32rem] w-full overflow-hidden rounded-xl border border-line">
          <ErrorPage />
        </div>
      </Demo>

      <Demo title="Live users">
        <div>
          <h2>Viewing this office</h2>

          {presentUsers.length === 0 ? (
            <p>No users currently viewing this office.</p>
          ) : (
            <ul>
              {presentUsers.map((user) => (
                <li key={user.id}>
                  {user.first_name} {user.last_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Demo>
    </div>
  );
}
