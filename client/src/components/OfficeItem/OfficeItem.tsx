import { RadioGroup } from "radix-ui";

import type { Office } from "@/types/api/offices";

type OfficeItemProps = {
  office: Office;
};

export default function OfficeItem({ office }: OfficeItemProps) {
  const normalizedName = office.name.toLowerCase();
  const isRemote = normalizedName === "remote";
  const emoji = office.emoji ?? "🏢";

  return (
    <RadioGroup.Item
      value={String(office.id)}
      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border text-fg transition-colors hover:border-line-faint focus-visible:ring-2 focus-visible:ring-line-faint focus-visible:outline-none data-[state=checked]:border-fill data-[state=checked]:bg-surface-muted ${
        isRemote ? "border-dashed" : "border-solid"
      } border-line`}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>

      <span className="font-medium capitalize">{office.name}</span>
    </RadioGroup.Item>
  );
}
