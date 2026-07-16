import { cn } from "@/util/cn";

interface LogoProps {
  className?: string;
}

// The shared Hearth brand mark. The image asset lives at `client/public/logo.svg`
// (referenced by URL so it can be swapped without a rebuild). The logo is
// decorative wherever the "Hearth" wordmark already appears beside it, so it is
// hidden from assistive tech via an empty alt.
export default function Logo({ className }: LogoProps) {
  return <img src="/logo.svg" alt="" className={cn("h-16 w-16", className)} />;
}
