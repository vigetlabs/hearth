type PencilIconProps = {
  className?: string;
};

export default function PencilIcon({ className }: PencilIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <path
        d="M9.8995 3.82842L14.1421 8.07109L4.24264 17.9706H0V13.7279L9.8995 3.82842ZM11.3137 2.41421L13.435 0.29289C13.8256 -0.09763 14.4587 -0.09763 14.8492 0.29289L17.6777 3.12132C18.0682 3.51184 18.0682 4.14501 17.6777 4.53553L15.5563 6.65685L11.3137 2.41421Z"
        fill="currentColor"
      />
    </svg>
  );
}
