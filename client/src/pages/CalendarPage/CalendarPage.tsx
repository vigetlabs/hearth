import { Calendar } from "@/components/Calendar/Calendar";
import type { EventsByDate } from "@/types/calendar/calendar";
import { addDays, startOfWeek, toDateKey } from "@/util/dates/date";

// Sample data anchored to the current week so it shows up in both views.
const weekStart = startOfWeek(new Date());
const sampleEvents: EventsByDate = {
  [toDateKey(weekStart)]: ["Alice", "Bob"],
  [toDateKey(addDays(weekStart, 2))]: ["Carol"],
  [toDateKey(addDays(weekStart, 4))]: ["Dave", "Erin", "Frank"],
  [toDateKey(addDays(weekStart, 8))]: ["Grace"],
  [toDateKey(addDays(weekStart, 15))]: ["Heidi", "Ivan"],
};

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Schedule</h1>
      <Calendar events={sampleEvents} />
    </div>
  );
}
