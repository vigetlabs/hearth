import { Calendar } from "@/components/Calendar/Calendar";
import type {
  AttendanceStatus,
  PersonStatus,
  WeekSchedule,
} from "@/types/calendar/calendar";
import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";

// The office roster is the same every day; only each person's status changes.
const ROSTER = [
  "Jackson F",
  "Abby S",
  "Natalie D",
  "Tommy B",
  "Laura L",
  "Blair C",
  "Jeremy F",
  "Sam P",
  "Riley K",
  "Morgan T",
];

// Per-day status overrides by name; anyone not listed defaults to "no".
type Overrides = Record<string, AttendanceStatus>;

export default function CalendarPage() {
  const { user } = useAuth();
  const me = userDisplayName(user);

  // The logged-in user is part of the roster too (the day cell sorts everyone
  // by status and name, so order here doesn't matter).
  const roster = me ? [me, ...ROSTER] : ROSTER;

  function day(overrides: Overrides): PersonStatus[] {
    return roster.map((name) => ({ name, status: overrides[name] ?? "no" }));
  }

  const weekStart = startOfWeek(new Date());
  const sampleSchedule: WeekSchedule = {
    [toDateKey(weekStart)]: day({
      [me]: "confirmed",
      "Jackson F": "confirmed",
      "Abby S": "confirmed",
      "Laura L": "confirmed",
      "Natalie D": "maybe",
      "Riley K": "maybe",
    }),
    [toDateKey(addDays(weekStart, 1))]: day({
      [me]: "confirmed",
      "Jackson F": "confirmed",
      "Blair C": "confirmed",
      "Laura L": "maybe",
      "Sam P": "maybe",
      "Morgan T": "maybe",
    }),
    [toDateKey(addDays(weekStart, 2))]: day({
      "Natalie D": "maybe",
      "Riley K": "maybe",
      "Sam P": "maybe",
    }),
    [toDateKey(addDays(weekStart, 3))]: day({
      [me]: "confirmed",
      "Natalie D": "confirmed",
      "Tommy B": "confirmed",
      "Laura L": "confirmed",
      "Blair C": "confirmed",
      "Jeremy F": "confirmed",
      "Abby S": "confirmed",
      "Sam P": "maybe",
    }),
    [toDateKey(addDays(weekStart, 4))]: day({
      "Blair C": "confirmed",
      "Tommy B": "confirmed",
      "Laura L": "confirmed",
      "Abby S": "confirmed",
      "Jeremy F": "confirmed",
      "Jackson F": "maybe",
      "Riley K": "maybe",
    }),
  };

  return (
    // `flex-1` fills the space below the sticky header; `overflow-hidden` keeps
    // the page pinned to the viewport so it can't scroll or overscroll. The
    // `py-8` leaves breathing room above and below the calendar card.
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <Calendar schedule={sampleSchedule} />
      </div>
    </div>
  );
}
