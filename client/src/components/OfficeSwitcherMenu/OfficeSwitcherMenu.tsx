import { Fragment } from "react";

import type { Office } from "@/types/api/offices";
import { cn } from "@/util/cn";

interface OfficeSwitcherMenuProps {
  offices: Office[];
  onSelect?: (office: Office) => void;
  className?: string;
}

// The open office-switcher card, split out from OfficeSwitcher so it can be
// shown on its own. A white rounded card led by a short explainer, then one
// row per office divided by hairlines. Switching here is for viewing another
// office's schedule — it doesn't change the user's default office.
export default function OfficeSwitcherMenu({
  offices,
  onSelect,
  className,
}: OfficeSwitcherMenuProps) {
  return (
    <div
      className={cn(
        "w-64 overflow-hidden rounded-[20px] bg-surface shadow-xl ring-1 ring-black/5",
        className,
      )}
    >
      <p className="px-4 py-2 text-xs leading-snug text-fg-muted">
        View schedules and plan visits. This doesn&rsquo;t change your default
        office.
      </p>

      {offices.map((office) => (
        <Fragment key={office.id}>
          <div className="h-px bg-line" />
          <button
            type="button"
            onClick={() => onSelect?.(office)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
          >
            <span className="text-2xl" aria-hidden="true">
              {office.emoji}
            </span>
            <span className="text-xl text-fg">{office.name}</span>
          </button>
        </Fragment>
      ))}
    </div>
  );
}
