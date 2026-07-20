import CheckIcon from "@/components/icons/CheckIcon";
import MinusIcon from "@/components/icons/MinusIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import XIcon from "@/components/icons/XIcon";
import type { AttendanceStatus } from "@/types/calendar/calendar";
import { cn } from "@/util/cn";

/** The four attendance states plus the "add me to this day" affordance. */
export type StatusMark = AttendanceStatus | "add";

/** Visual treatment of the circle around the glyph. Kept separate from the mark
    so the same check/minus/x/plus can render dark-filled, outlined, or dashed
    depending on context (day header vs. group heading, planning vs. locked). */
export type StatusVariant = "outline" | "solid" | "dashed";

type Size = "sm" | "md" | "lg";

const GLYPH = {
  "confirmed-yes": CheckIcon,
  "planning-yes": MinusIcon,
  "planning-no": XIcon,
  "confirmed-no": XIcon,
  add: PlusIcon,
} as const;

const CIRCLE_SIZE: Record<Size, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

const GLYPH_SIZE: Record<Size, string> = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

const VARIANT: Record<StatusVariant, string> = {
  outline: "border border-line-strong text-fg",
  solid: "border border-strong bg-strong text-fg-inverse",
  dashed: "border border-dashed border-line-faint bg-surface-strong text-fg",
};

interface StatusIconProps {
  mark: StatusMark;
  variant?: StatusVariant;
  size?: Size;
  /** Escape hatch for one-off color overrides (e.g. on dark headers). */
  className?: string;
}

/** A circular status glyph used across the calendar. Restyle the whole set of
    marks — the day-header toggle and every group heading — from here. */
export function StatusIcon({
  mark,
  variant = "outline",
  size = "sm",
  className = "",
}: StatusIconProps) {
  const Glyph = GLYPH[mark];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        CIRCLE_SIZE[size],
        VARIANT[variant],
        className,
      )}
    >
      <Glyph className={GLYPH_SIZE[size]} />
    </span>
  );
}
