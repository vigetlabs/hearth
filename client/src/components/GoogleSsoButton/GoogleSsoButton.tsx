import GoogleIcon from "@/components/icons/GoogleIcon";

import { redirectToGoogleSso } from "@/util/auth/redirectToGoogleSso";
import { cn } from "@/util/cn";

interface GoogleSsoButtonProps {
  className?: string;
}

export default function GoogleSsoButton({ className }: GoogleSsoButtonProps) {
  return (
    <button
      type="button"
      onClick={redirectToGoogleSso}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border border-line-strong px-4 py-3 font-semibold text-fg transition-colors hover:bg-surface-sunken",
        className,
      )}
    >
      <GoogleIcon className="h-5 w-5" />
      Continue with Google
    </button>
  );
}
