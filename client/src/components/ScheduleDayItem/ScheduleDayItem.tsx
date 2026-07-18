import PickerItem from "@/components/PickerItem/PickerItem";
import type { Weekday } from "@/types/schedule/schedule";
import { cn } from "@/util/cn";

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
    <PickerItem
      onClick={() => onToggle(day.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      className={cn(
        "aspect-[2/1] gap-1 rounded-xl p-3 text-center",
        isSelected
          ? "border-2 border-line-selected bg-selected"
          : "border border-line",
      )}
    >
      <span className="text-sm font-bold">{day.label}</span>

      <span className="text-[0.625rem] text-fg-subtle" aria-hidden="true">
        {isSelected ? "✓ in office" : "+ add"}
      </span>
    </PickerItem>
  );
}
