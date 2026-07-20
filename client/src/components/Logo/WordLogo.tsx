import { cn } from "@/util/cn";

interface WordLogoProps {
  className?: string;
}

// The "Hearth" wordmark. The image asset lives at `client/public/word-logo.svg`
// (referenced by URL so it can be swapped without a rebuild). Unlike the
// decorative mark in `Logo`, this spells out the brand name, so it carries the
// "Hearth" text as its alt for assistive tech.
export default function WordLogo({ className }: WordLogoProps) {
  return (
    <img
      src="/word-logo.svg"
      alt="Hearth"
      className={cn("h-6 w-auto", className)}
    />
  );
}
