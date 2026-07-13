import type { Weekday } from "@/types/schedule/schedule";

type ScheduleDayItemProps = {
  day: Weekday;
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
      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none ${
        isSelected ? "border-neutral-500 bg-neutral-100" : "border-neutral-200"
      }`}
    >
      <span className="text-sm font-bold">{day.label}</span>

      <span className="text-xs text-neutral-500" aria-hidden="true">
        {isSelected ? "✓" : "+"}
      </span>
    </button>
  );
}
