import { useEffect, useState } from "react";

import WordLogo from "@/components/Logo/WordLogo";

import { redirectToGoogleSso } from "@/util/auth/redirectToGoogleSso";
import { cn } from "@/util/cn";
import { scrollToSection } from "@/util/scrollToSection";

const NAV_LINKS = [
  { label: "Home", targetId: "home" },
  { label: "Product", targetId: "product" },
  { label: "Why Hearth", targetId: "why-hearth" },
  { label: "Viget article", targetId: "viget-article" },
];

// How far down the viewport a section's top edge has to climb before that
// section counts as the one being read: the bottom edge of the floating bar,
// which sits about 6.25rem down from the top of the page (its own height plus
// the gap above it). A section takes over as soon as it slides up behind the
// bar, and clicking a link — which lands the section's top edge on the top of
// the viewport, well past this line — always leaves that link selected.
const ACTIVE_LINE_PX = 100;

// Which section the page is currently parked on, tracked as the visitor
// scrolls. The page holds more sections than the bar has links (the quote,
// Slack and outro panels have no link of their own), so rather than look for a
// section filling the viewport we take the *last* linked section to have passed
// the line above — the unlinked panels read as part of the linked section they
// follow, which keeps that link lit instead of blanking the bar out between
// stops.
function useActiveSection() {
  const [activeId, setActiveId] = useState(NAV_LINKS[0].targetId);

  useEffect(() => {
    // Scroll events fire far faster than the screen repaints, so the work is
    // deferred to the next frame and extra events in the meantime collapse
    // into that one pending update.
    let frame: number | null = null;

    const measure = () => {
      frame = null;

      let current = NAV_LINKS[0].targetId;
      for (const { targetId } of NAV_LINKS) {
        const top = document
          .getElementById(targetId)
          ?.getBoundingClientRect().top;
        if (top !== undefined && top <= ACTIVE_LINE_PX) current = targetId;
      }

      setActiveId(current);
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    // Measure once on mount: the page can open part-way down when the browser
    // restores a previous scroll position.
    measure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return activeId;
}

// Floating nav bar for the signed-out marketing surface — fixed to the viewport
// so it holds the same spot on screen while the page scrolls from the hero down
// to the footer. The full-width wrapper only exists to center the bar, so it
// stays click-through and the bar itself takes the pointer events.
export default function Navbar() {
  const activeId = useActiveSection();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-6 sm:pt-8">
      <nav className="pointer-events-auto flex w-full max-w-[71rem] items-center justify-between gap-8 rounded-3xl border border-line bg-surface/70 py-4 pl-7 pr-4 shadow-[0_10px_30px_-8px_rgba(89,46,20,0.10)] backdrop-blur-md sm:pl-10 sm:pr-6">
        <WordLogo className="h-6 text-fg sm:h-7" />

        <div className="flex items-center gap-6 sm:gap-8">
          {/* The section the page is parked on holds the full terracotta the
              rest of the page accents with, so the bar always says where you
              are. Hovering an *unselected* label previews that move in the
              palette's lighter terracotta (the same tint as the State/Selected
              border) — lighter than the selected color, so a hovered label can
              never be mistaken for the selected one. The selected label takes
              no hover at all: it is already at the end of that ramp, and
              lightening it on hover would read as it switching off. */}
          {NAV_LINKS.map(({ label, targetId }) => {
            const active = targetId === activeId;

            return (
              <button
                key={label}
                type="button"
                onClick={() => scrollToSection(targetId)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "hidden cursor-pointer text-base font-medium transition-colors sm:block",
                  active ? "text-[#BC4A1F]" : "text-fg hover:text-[#DE8E6E]",
                )}
              >
                {label}
              </button>
            );
          })}

          {/* The only filled button on the page, so it takes the same hover the
              app's other `bg-strong` actions do: down to the darker
              Brand/Confirmed border color. */}
          <button
            type="button"
            onClick={redirectToGoogleSso}
            className="cursor-pointer rounded-full bg-strong px-5 py-2.5 text-base font-medium text-fg-inverse transition-colors hover:bg-strong-hover"
          >
            Sign in
          </button>
        </div>
      </nav>
    </div>
  );
}
