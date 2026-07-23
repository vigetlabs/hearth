type PlusIconProps = {
  className?: string;
  /** "thick" (default) for the marks next to names, "thin" for day-header icons. */
  weight?: "thick" | "thin";
};

export default function PlusIcon({
  className,
  weight = "thick",
}: PlusIconProps) {
  const thin = weight === "thin";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d={thin ? "M8 3.5v9M3.5 8h9" : "M8 4v8M4 8h8"}
        stroke="currentColor"
        strokeWidth={thin ? "1.5" : "3"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
