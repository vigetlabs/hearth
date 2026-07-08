import { isSameDay } from "@/util/dates/date";

interface DayCellProps {
  date: Date;
  names: string[];
}

export function DayCell({ date, names }: DayCellProps) {
  const isToday = isSameDay(date, new Date());

  return (
    <div className="flex min-h-28 flex-col gap-1 rounded-md border border-gray-200 p-2">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-6 w-6 items-center justify-center text-sm ${
            isToday
              ? "rounded-full bg-blue-500 font-medium text-white"
              : "text-gray-600"
          }`}
        >
          {date.getDate()}
        </span>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md text-sm hover:bg-gray-100"
          aria-label="Home"
        >
          🏠
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        {names.map((name, i) => (
          <li
            key={`${name}-${i}`}
            className="truncate rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800"
            title={name}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
