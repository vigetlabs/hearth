import { WEEKDAYS } from "@/types/schedule/schedule";

type ScheduleDay = (typeof WEEKDAYS)[number];

type ScheduleDayItemProps = {
  day: ScheduleDay;
  isSelected: boolean;
  onToggle: (dayId: string) => void;
};

export default function ScheduleDayItem({
  day,
  isSelected,
  onToggle,
}: ScheduleDayItemProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(day.id)}
      aria-pressed={isSelected}
      className={`flex h-24 w-28 flex-col items-center justify-center gap-1 rounded-2xl border text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none ${
        isSelected ? "border-neutral-500 bg-neutral-100" : "border-neutral-200"
      }`}
    >
      <span className="text-lg font-bold">{day.label}</span>

      <span className="text-sm text-neutral-500">
        {isSelected ? "✓ in office" : "+ add"}
      </span>
    </button>
  );
}
