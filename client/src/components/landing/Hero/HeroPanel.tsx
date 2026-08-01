import type { ReactNode } from "react";

import { cn } from "@/util/cn";

// The right-hand image panel shared by the office and schedule pickers. Owning
// the panel dimensions in one place keeps the two pages from drifting apart —
// same width, same background, so a hero rendered in it looks identical across
// pages. It's decorative, hence aria-hidden.
export default function HeroPanel({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative hidden overflow-hidden bg-surface-strong lg:block lg:w-[50%]",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
