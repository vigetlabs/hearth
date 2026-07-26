import { addDays, generateDateKey, startOfWeek } from "@/util/dates/date";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

interface CalendarWeekSelection {
  weekStart: Date;
  weekStartKey: string;
  weekDates: readonly Date[];
  changeWeek: (nextWeek: Date) => void;
}

export function useCalendarWeekSelection(): CalendarWeekSelection {
  const [searchParams, setSearchParams] = useSearchParams();

  const [weekStart, setWeekStart] = 
    useState<Date>(() => getWeekStartFromSearchParams(searchParams))

  const weekStartKey = generateDateKey(weekStart);

  const weekDates = useMemo(
    () => 
      Array.from(
        { length: 5 },
        (_, index) => addDays(weekStart, index)
      ),
    [weekStart],
  );

  const changeWeek = useCallback(
    (nextWeek: Date): void => {
      const normalizedWeekStart = startOfWeek(nextWeek);

      setWeekStart(normalizedWeekStart);

      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        setDateSearchParams(
          nextParams,
          normalizedWeekStart
        );

        return nextParams;
      });
    },
    [setSearchParams]
  );

  return {
    weekStart,
    weekStartKey,
    weekDates,
    changeWeek
  }
}

function getWeekStartFromSearchParams(searchParams: URLSearchParams): Date {
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));
  const day = Number(searchParams.get("day"));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return startOfWeek(new Date());
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return startOfWeek(new Date());
  }

  const parsedDate = new Date(year, month - 1, day);

  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  if (!isValidDate) {
    return startOfWeek(new Date());
  }

  return startOfWeek(parsedDate);
}

function setDateSearchParams(params: URLSearchParams, date: Date): void {
  params.set("year", String(date.getFullYear()));
  params.set("month", String(date.getMonth() + 1));
  params.set("day", String(date.getDate()));
}
