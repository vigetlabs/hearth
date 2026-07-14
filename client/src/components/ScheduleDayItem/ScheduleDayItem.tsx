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
      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center text-fg transition-colors hover:border-line-faint focus-visible:ring-2 focus-visible:ring-line-faint focus-visible:outline-none ${
        isSelected ? "border-fill bg-surface-muted" : "border-line"
      }`}
    >
      <span className="text-sm font-bold">{day.label}</span>

      <span className="text-xs text-fg-subtle" aria-hidden="true">
        {isSelected ? "✓" : "+"}
      </span>
    </button>
  );
}
