type PlusWeight = "thick" | "thin" | "x-thin";

type PlusIconProps = {
  className?: string;
  /** "thick" (default) for the marks next to names, "thin" for day-header icons, "x-thin" for the hairline mark in the landing nav. */
  weight?: PlusWeight;
};

// Stroke thickness scales with the icon's own box rather than with pixels, so a
// weight reads the same however large the icon is rendered. The arms grow as
// the stroke thins: a hairline needs to reach further to keep the mark from
// shrinking into a speck, while the thick mark stops short so its rounded caps
// stay inside the box.
const WEIGHTS: Record<PlusWeight, { d: string; strokeWidth: string }> = {
  thick: { d: "M8 4v8M4 8h8", strokeWidth: "3" },
  thin: { d: "M8 3.5v9M3.5 8h9", strokeWidth: "1.5" },
  "x-thin": { d: "M8 2.5v11M2.5 8h11", strokeWidth: "1" },
};

export default function PlusIcon({
  className,
  weight = "thick",
}: PlusIconProps) {
  const { d, strokeWidth } = WEIGHTS[weight];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
