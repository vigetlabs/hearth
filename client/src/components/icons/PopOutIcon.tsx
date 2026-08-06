type PopOutIconProps = {
  className?: string;
};

// Slack's "open this view in a separate window" glyph: a panel with an arrow
// leaving it through the corner. Used in the Slack DM mock on the landing page.
export default function PopOutIcon({ className }: PopOutIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M13 9.25v3.25A1.5 1.5 0 0 1 11.5 14h-8A1.5 1.5 0 0 1 2 12.5v-8A1.5 1.5 0 0 1 3.5 3h3.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.75 2H14v4.25M13.75 2.25L8.25 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
