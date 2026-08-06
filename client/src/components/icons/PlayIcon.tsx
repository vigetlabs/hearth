type PlayIconProps = {
  className?: string;
};

// Filled play triangle, sized to sit optically centered in a round button: the
// shape is nudged a touch right of center so its visual mass, not its bounding
// box, lands in the middle.
export default function PlayIcon({ className }: PlayIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M6 3.9l6 4.1-6 4.1z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
