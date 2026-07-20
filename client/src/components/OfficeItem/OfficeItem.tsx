import { RadioGroup } from "radix-ui";

import PickerItem from "@/components/PickerItem/PickerItem";
import type { Office } from "@/types/api/offices";
import { cn } from "@/util/cn";

interface OfficeItemProps {
  office: Office;
  className?: string;
}

export default function OfficeItem({ office, className }: OfficeItemProps) {
  const normalizedName = office.name.toLowerCase();
  const isRemote = normalizedName === "remote";
  const emoji = office.emoji ?? "🏢";

  const itemClasses = cn(
    "aspect-square gap-0.5 rounded-2xl border border-line bg-surface",
    "data-[state=checked]:border-line-selected data-[state=checked]:bg-selected data-[state=checked]:shadow-[inset_0_0_0_1px_var(--color-line-selected)]",
    "data-[state=checked]:hover:border-line-selected data-[state=checked]:hover:bg-selected",
    isRemote
      ? "border-dashed data-[state=checked]:border-solid"
      : "border-solid",
    className,
  );

  return (
    <RadioGroup.Item value={String(office.id)} asChild>
      <PickerItem className={itemClasses}>
        <span className="text-2xl" aria-hidden="true">
          {emoji}
        </span>

        <span className="-mt-0.5 text-xs font-semibold capitalize">
          {office.name}
        </span>
      </PickerItem>
    </RadioGroup.Item>
  );
}
