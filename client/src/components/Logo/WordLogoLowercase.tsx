import { cn } from "@/util/cn";

interface WordLogoLowercaseProps {
  className?: string;
}

// The lowercase "hearth" wordmark used in the app header. It mirrors `WordLogo`
// but renders the all-lowercase mark (a lowercase "h" with the flame counter)
// in the deep brown brand color. The image asset lives at
// `client/public/word-logo-lowercase.svg` (referenced by URL so it can be
// swapped without a rebuild). It spells out the brand name, so it carries the
// "hearth" text as its alt for assistive tech.
export default function WordLogoLowercase({
  className,
}: WordLogoLowercaseProps) {
  return (
    <img
      src="/word-logo-lowercase.svg"
      alt="hearth"
      className={cn("h-6 w-auto", className)}
    />
  );
}
