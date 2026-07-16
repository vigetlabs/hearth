import type { Weekday } from "@/types/schedule/schedule";

type ScheduleDayItemProps = {
  day: Weekday;
  isSelected: boolean;
  onToggle: (dayId: string) => void;
  disabled?: boolean;
};

export default function ScheduleDayItem({
  day,
  isSelected,
  onToggle,
  disabled = false,
}: ScheduleDayItemProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(day.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={`flex aspect-[2/1] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl p-3 text-center text-fg transition-colors hover:border-fill focus-visible:ring-2 focus-visible:ring-line-faint focus-visible:outline-none disabled:cursor-not-allowed ${
        isSelected
          ? "border-2 border-line-selected bg-surface-muted"
          : "border border-line-faint"
      }`}
    >
      <span className="text-xl font-bold">{day.label}</span>

      <span className="text-xs text-fg-subtle" aria-hidden="true">
        {isSelected ? "✓ in office" : "+ add"}
      </span>
    </button>
  );
}
