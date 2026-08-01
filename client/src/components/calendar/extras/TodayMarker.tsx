import { WEEKDAYS_PER_WEEK } from "@/util/calendar/viewModel/gridBuilder";

interface TodayMarkerProps {
  dayIndex: number;
  locked: boolean;
}

export default function TodayMarker({ dayIndex, locked }: TodayMarkerProps) {
  return (
    <span
      data-tour="today-pill"
      className={`pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        locked
          ? "border border-strong bg-surface text-fg"
          : "bg-strong text-fg-inverse"
      }`}
      style={{
        left: `${((dayIndex + 0.5) / WEEKDAYS_PER_WEEK) * 100}%`,
      }}
    >
      Today
    </span>
  );
}
