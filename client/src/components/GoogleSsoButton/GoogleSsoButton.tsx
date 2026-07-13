import GoogleIcon from "@/components/icons/GoogleIcon";

import { redirectToGoogleSso } from "@/util/auth/redirectToGoogleSso";

export default function GoogleSsoButton() {
  return (
    <button
      type="button"
      onClick={redirectToGoogleSso}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-strong px-4 py-3 font-semibold text-fg transition-colors hover:bg-surface-sunken"
    >
      <GoogleIcon className="h-5 w-5" />
      Continue with Google
    </button>
  );
}
