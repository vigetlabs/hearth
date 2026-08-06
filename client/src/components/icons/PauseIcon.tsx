type PauseIconProps = {
  className?: string;
};

// The two bars of a pause control, drawn as round-capped strokes so they match
// the weight of the other 16x16 icons.
export default function PauseIcon({ className }: PauseIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M6 3.75v8.5M10 3.75v8.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
