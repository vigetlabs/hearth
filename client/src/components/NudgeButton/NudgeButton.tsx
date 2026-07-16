import NudgeIcon from "@/components/icons/NudgeIcon";

interface NudgeButtonProps {
  /** Display name of the person being nudged, used for the accessible label. */
  name: string;
  /** Fired when the button is pressed. */
  onClick?: () => void;
  /** Extra classes appended to the default styling. */
  className?: string;
}

/** A pill-shaped "Nudge" button for poking someone who hasn't confirmed yet.
    Extracted from the calendar roster so it can be reused anywhere. */
export default function NudgeButton({
  name,
  onClick,
  className = "",
}: NudgeButtonProps) {
  return (
    <button
      type="button"
      aria-label={`Nudge ${name}`}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full border border-line-strong px-2 py-0.5 text-xs font-medium text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg ${className}`}
    >
      <NudgeIcon className="h-3.5 w-3.5" />
      Nudge
    </button>
  );
}
