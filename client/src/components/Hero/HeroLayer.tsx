import type { CSSProperties } from "react";

import { cn } from "@/util/cn";

// A single hero image layer inside a HeroPanel. This is the one source of truth
// for the image box geometry: it overhangs the panel horizontally by 2.5rem on
// each side (-inset-x-10) so a sliding crossfade never sweeps a bare edge into
// view, and so `bg-cover` always scales the image against the same box width no
// matter which page renders it. A static hero and an animating one must use the
// same box, or the identical image crops/scales differently between pages.
export default function HeroLayer({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 -inset-x-10 bg-cover bg-center",
        className,
      )}
      style={{ backgroundImage: `url(${src})`, ...style }}
    />
  );
}
