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
      className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border text-fg-primary transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none data-[state=checked]:border-neutral-500 data-[state=checked]:bg-neutral-100 ${
        isRemote ? "border-dashed" : "border-solid"
      } border-neutral-200`}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>

      <span className="font-medium capitalize">{office.name}</span>
    </RadioGroup.Item>
  );
}
