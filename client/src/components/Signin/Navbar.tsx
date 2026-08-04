import WordLogo from "@/components/Logo/WordLogo";

import { redirectToGoogleSso } from "@/util/auth/redirectToGoogleSso";

// Placeholder nav labels, one per section of the page below. Nothing is wired
// up yet — see the nav markup below.
const NAV_LINKS = ["Home", "Product", "Why Hearth", "Viget article"];

// Floating nav bar for the signed-out marketing surface — fixed to the viewport
// so it holds the same spot on screen while the page scrolls from the hero down
// to the footer. The full-width wrapper only exists to center the bar, so it
// stays click-through and the bar itself takes the pointer events. The links are
// placeholders for now: they are rendered as inert text rather than links so
// nothing advertises an action that doesn't exist yet. The sign-in button kicks
// off the same Google SSO redirect as the main button in the sign-in card.
export default function Navbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex justify-center px-4 pt-6 sm:pt-8">
      <nav className="pointer-events-auto flex w-full max-w-[68rem] items-center justify-between gap-8 rounded-3xl border border-line bg-surface/70 py-4 pl-7 pr-4 shadow-[0_10px_30px_-8px_rgba(89,46,20,0.10)] backdrop-blur-md sm:pl-10 sm:pr-6">
        <WordLogo className="h-6 text-fg sm:h-7" />

        <div className="flex items-center gap-6 sm:gap-8">
          {NAV_LINKS.map((label) => (
            <span
              key={label}
              className="hidden text-base font-medium text-fg sm:block"
            >
              {label}
            </span>
          ))}

          <button
            type="button"
            onClick={redirectToGoogleSso}
            className="cursor-pointer rounded-full bg-strong px-5 py-2.5 text-base font-medium text-fg-inverse"
          >
            Sign in
          </button>
        </div>
      </nav>
    </div>
  );
}
