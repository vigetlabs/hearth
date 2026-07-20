type PencilIconProps = {
  className?: string;
};

export default function PencilIcon({ className }: PencilIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      {/* Pencil tip + body */}
      <path d="M2.5 13.5 L5.19 13.36 L11.55 7 L9.01 4.45 L2.64 10.81 Z" />
      {/* Eraser (separated by a small gap) */}
      <path d="M12.12 6.43 L13.31 5.23 L10.77 2.69 L9.57 3.88 Z" />
    </svg>
  );
}
