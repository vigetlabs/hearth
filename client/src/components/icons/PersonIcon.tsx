type PersonIconProps = {
  className?: string;
};

export default function PersonIcon({ className }: PersonIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1.5c-2.9 0-5.5 1.6-5.5 3.7 0 .4.3.8.8.8h9.4c.5 0 .8-.4.8-.8 0-2.1-2.6-3.7-5.5-3.7Z" />
    </svg>
  );
}
