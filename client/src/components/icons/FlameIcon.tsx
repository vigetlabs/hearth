type FlameIconProps = {
  className?: string;
};

export default function FlameIcon({ className }: FlameIconProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 0.847656C6 0.847656 0.5 3.88766 0.5 7.08766C0.5 9.16766 3.10526 10.8477 6 10.8477C8.89474 10.8477 11.5 9.16766 11.5 7.08766C11.5 6.12766 10.4868 5.16766 10.4868 5.16766C10.4868 6.20766 8.75 6.60766 8.75 6.60766C9.47368 4.52766 6 3.32766 6 0.847656Z"
        fill="currentColor"
        stroke="currentColor"
      />
    </svg>
  );
}
