type MinusIconProps = {
  className?: string;
  /** "thick" (default) for the marks next to names, "thin" for day-header icons. */
  weight?: "thick" | "thin";
};

export default function MinusIcon({
  className,
  weight = "thick",
}: MinusIconProps) {
  const thin = weight === "thin";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d={thin ? "M3.5 8h9" : "M4 8h8"}
        stroke="currentColor"
        strokeWidth={thin ? "1.5" : "3"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
