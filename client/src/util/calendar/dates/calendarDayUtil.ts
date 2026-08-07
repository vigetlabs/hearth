import type { CalendarDay } from "@/types/calendar/dates/calendarDay";

const WEEKDAYS_PER_WEEK = 5;

export function getWeekDays(
  weekStart: Date,
  length = WEEKDAYS_PER_WEEK,
): CalendarDay[] {
  return Array.from({ length }, (_, index) => {
    const date = addDays(weekStart, index);

    return {
      date,
      key: generateDateKey(date),
    };
  });
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function generateDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
