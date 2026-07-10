import { Calendar } from "@/components/Calendar/Calendar";
import type { EventsByDate } from "@/types/calendar/calendar";
import { useAuth } from "@/util/auth/useAuth";
import { userDisplayName } from "@/util/auth/displayName";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";

export default function CalendarPage() {
  const { user } = useAuth();
  const me = userDisplayName(user);

  // Sample data anchored to the current week, seeding the logged-in user on a
  // few days so their highlight and the in/out toggle are visible.
  const weekStart = startOfWeek(new Date());
  const sampleEvents: EventsByDate = {
    [toDateKey(weekStart)]: ["Jackson F", "Abby Smith", me].filter(Boolean),
    [toDateKey(addDays(weekStart, 1))]: ["Jackson F", me].filter(Boolean),
    [toDateKey(addDays(weekStart, 2))]: ["Natalie D", "Tommy B", "Laura L"],
    [toDateKey(addDays(weekStart, 3))]: [me].filter(Boolean),
    [toDateKey(addDays(weekStart, 4))]: [
      "Blair C",
      "Tommy B",
      "Laura L",
      "Abby S",
      "Jeremy F",
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-6">
        <Calendar events={sampleEvents} />
      </div>
    </div>
  );
}
