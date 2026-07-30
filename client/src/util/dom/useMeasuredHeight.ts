import { useLayoutEffect, useState } from "react";

/**
 * Tracks an element's inner height, remeasuring whenever it resizes.
 *
 * Returns a callback ref rather than a `useRef`, so measuring still works when
 * the element is conditionally rendered — the effect re-runs the moment a
 * different node (or none) is attached.
 *
 * The height is `null` until the first measurement lands, which lets callers
 * tell "not measured yet" apart from "measured, and it's zero".
 */
export function useMeasuredHeight<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!element) return;

    // `observe` delivers a first observation of its own, after layout but
    // before paint, so the opening frame is already measured — no separate
    // initial read, and nothing flashes at full height.
    const observer = new ResizeObserver(() => {
      setHeight(element.clientHeight);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return [setElement, height] as const;
}
