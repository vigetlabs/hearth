import { Calendar } from "@/components/Calendar/Calendar";
import {
  mockOfficeId,
  officeSchedule,
} from "@/pages/CalendarPage/officeSchedules";
import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { useOffice } from "@/util/office/useOffice";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";

const WEEKDAYS_PER_WEEK = 5;

export default function CalendarPage() {
  const { user } = useAuth();
  const { office } = useOffice();
  const me = userDisplayName(user);

  const weekStart = startOfWeek(new Date());
  const weekDates = Array.from({ length: WEEKDAYS_PER_WEEK }, (_, i) =>
    addDays(weekStart, i),
  );

  const schedule = officeSchedule(mockOfficeId(office.id), weekDates);

  // The logged-in user is part of the roster too: seed them into each day as
  // "out" so they show up and can toggle themselves in. The day cell sorts
  // everyone by status and name, so order here doesn't matter.
  if (me) {
    for (const date of weekDates) {
      const key = toDateKey(date);
      const day = schedule[key] ?? [];
      if (!day.some((person) => person.name === me)) {
        schedule[key] = [{ name: me, status: "planning-no" }, ...day];
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface-sunken">
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <Calendar schedule={schedule} key={office.id} />
      </div>
    </div>
  );
}
