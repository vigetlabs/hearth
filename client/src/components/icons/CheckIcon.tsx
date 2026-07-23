type CheckIconProps = {
  className?: string;
  /** "thick" (default) for the marks next to names, "thin" for day-header icons. */
  weight?: "thick" | "thin";
};

export default function CheckIcon({
  className,
  weight = "thick",
}: CheckIconProps) {
  const thin = weight === "thin";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="m4 8.25 3 3 5-5.5"
        stroke="currentColor"
        strokeWidth={thin ? "1.5" : "3"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
