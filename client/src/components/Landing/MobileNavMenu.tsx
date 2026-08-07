import { useState } from "react";
import { DropdownMenu } from "radix-ui";

import PlusIcon from "@/components/icons/PlusIcon";

import { NAV_LINKS, navLinkClass } from "@/components/Landing/navLinks";
import { cn } from "@/util/cn";

import "./MobileNavMenu.css";

type MobileNavMenuProps = {
  /** The section the page is currently parked on, so the menu can light the
      same link the bar's own row would have. */
  activeId: string;
};

// The nav links as a phone gets them: a plus button in the bar that drops a
// panel of the same four stops underneath it. It stands in for the row of
// links, which a phone has no room for, so the two never show at once — the
// whole thing is hidden from `sm` up, where the row takes over.
//
// It is a separate element rather than the bar's own links re-arranged at a
// breakpoint because the two are only the same *list*: these sit in a card
// portalled out of the bar, and they carry dismissal, focus return and
// `aria-expanded` that a plain row of anchors must not. What they genuinely
// share — the stops themselves and the color that marks the selected one —
// comes from `navLinks.ts`, so the two can't drift apart.
//
// The panel is deliberately not modal: it hangs off a bar that floats over the
// page rather than covering it, so the page behind stays scrollable and keeps
// its scrollbar (a scroll lock would jog the fixed bar sideways as it opened).
// Dismissing on Escape or on a tap outside is Radix's either way.
export default function MobileNavMenu({ activeId }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      {/* The mark turns rather than swapping for a different icon: a plus is
          the same shape every quarter turn, so any odd multiple of 45° lands on
          an x. It goes the long way round — 135° instead of the nearest 45° —
          because the short version is over before it reads as a turn at all,
          where three eighths is unmistakably the button rotating. */}
      <DropdownMenu.Trigger
        aria-label={open ? "Close menu" : "Open menu"}
        className="group cursor-pointer text-fg outline-none transition-colors hover:text-strong-soft sm:hidden"
      >
        <PlusIcon
          weight="x-thin"
          className="h-6 w-6 transition-transform duration-300 ease-out group-data-[state=open]:rotate-[135deg] motion-reduce:transition-none"
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/* Hung off the right edge of the bar rather than off the button
            itself: `alignOffset` pays back the bar's own right padding, so the
            panel's edge lines up with the bar's instead of sitting an
            indent inside it. `collisionPadding` matches the page's side
            padding, so a panel that has to shift stops exactly where the bar
            does.

            The surface is the bar's own — the same translucency over the same
            blur — so the panel reads as the bar extending downward rather than
            as a solid card hung off it.

            `sm:hidden` is for the one case the trigger can't cover on its own:
            the panel lives in a portal at the end of the body, so a window
            widened past the breakpoint while it is open would otherwise leave
            it behind after the button it belongs to had gone. */}
        <DropdownMenu.Content
          align="end"
          alignOffset={-16}
          sideOffset={32}
          collisionPadding={16}
          className="landing-nav-menu z-30 min-w-[11rem] rounded-2xl bg-surface/85 p-2 shadow-nav backdrop-blur-md sm:hidden"
        >
          {NAV_LINKS.map(({ label, targetId }) => {
            const active = targetId === activeId;

            return (
              <DropdownMenu.Item key={label} asChild>
                <a
                  href={`#${targetId}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "block cursor-pointer rounded-xl px-3 py-2 text-base font-medium outline-none transition-colors",
                    navLinkClass(active, "highlighted"),
                  )}
                >
                  {label}
                </a>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
