import { cn } from "@/util/cn";

type MoreAttendeesChipProps = {
  /** How many attendees are hidden — rendered as "+{count} more" unless
      `label` overrides it. */
  count?: number;
  /** Replaces the default "+{count} more" text, e.g. "View all". */
  label?: string;
  /** Announced to screen readers in place of the visible text, so the chip can
      say which list it opens. */
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * Outlined pill standing in for attendees that didn't fit in a roster —
 * a leading ellipsis followed by "+{count} more".
 */
export default function MoreAttendeesChip({
  count,
  label,
  ariaLabel,
  onClick,
  className,
}: MoreAttendeesChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border-2 border-line px-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 10 2"
        fill="currentColor"
        className="h-0.5 w-2.5 shrink-0"
      >
        <circle cx="0.8" cy="1" r="0.8" />
        <circle cx="5" cy="1" r="0.8" />
        <circle cx="9.2" cy="1" r="0.8" />
      </svg>
      {label ?? `+${count} more`}
    </button>
  );
}
