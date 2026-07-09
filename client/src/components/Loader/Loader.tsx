interface LoaderProps {
  size?: string;
}

export default function Loader({ size = "h-5 w-5" }: LoaderProps) {
  return (
    <div
      className={`${size} animate-spin rounded-full border-2 border-gray-300 border-t-gray-900`}
    />
  );
}
