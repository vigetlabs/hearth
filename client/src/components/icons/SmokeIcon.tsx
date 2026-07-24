type SmokeIconProps = {
  className?: string;
};

// A dying campfire: crossed logs with a plume of smoke rising off them. Used on
// the error / empty-state screens, playing on the app's "Hearth" theme (the
// fire's gone out). Fully color-agnostic — every shape uses `currentColor`, so
// the mark inherits whatever text color the consumer sets (e.g.
// `text-fg-subtle`). Kept to a simple silhouette of overlapping blobs rather
// than the detailed source art.
export default function SmokeIcon({ className }: SmokeIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Smoke plume — overlapping circles merge into one rising silhouette */}
      <g fill="currentColor">
        <circle cx="30" cy="40" r="8" />
        <circle cx="37.5" cy="33" r="6.5" />
        <circle cx="25.5" cy="30" r="6.5" />
        <circle cx="33" cy="23" r="5.5" />
        <circle cx="29" cy="16" r="4.5" />
        <circle cx="32" cy="10" r="3" />
        {/* detached side puff, echoing the source art */}
        <circle cx="45" cy="28" r="3.5" />
      </g>

      {/* Crossed logs of the fire pit */}
      <path
        d="M18 49 L46 55 M18 55 L46 49"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Embers */}
      <g fill="currentColor">
        <circle cx="29.5" cy="51.5" r="1.5" />
        <circle cx="35.5" cy="52.5" r="1" />
      </g>
    </svg>
  );
}
