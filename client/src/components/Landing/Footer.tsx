import WordLogo from "@/components/Logo/WordLogo";
import { ARTICLE_URL, VIGET_URL } from "@/components/Landing/links";

import { scrollToSection } from "@/util/scrollToSection";

// A footer link is one of two things, and which one decides both what it does
// and what it renders as: a jump to a section of this page (a button — there is
// no URL behind it and nothing to open in a new tab), or a trip off-site (a real
// link, which middle-clicks and opens in a new tab like any other).
type FooterLink =
  { label: string; targetId: string } | { label: string; href: string };

// The About column repeats the nav bar's section links, minus the article — the
// article gets a link of its own under Company, pointing at the write-up rather
// than at the section pitching it.
const LINK_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "About",
    links: [
      { label: "Home", targetId: "home" },
      { label: "Product", targetId: "product" },
      { label: "Why Hearth", targetId: "why-hearth" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Article", href: ARTICLE_URL },
      { label: "Viget", href: VIGET_URL },
    ],
  },
];

// Shared by both kinds of link, so a jump and a trip off-site are
// indistinguishable in the list — they read as one column of links.
const LINK_CLASSES =
  "cursor-pointer text-sm text-footer-muted transition-colors hover:text-fg-inverse";

// Marketing footer for the signed-out marketing surface (currently the sign-in
// page). Sits on the deep brown foreground color, so everything inside uses the
// inverse text tokens.
export default function Footer() {
  return (
    <footer className="bg-fg text-fg-inverse">
      {/* The max-width starts from half the leftover gutter a plain `max-w-5xl`
          (32rem half-width) would leave: gap = (100% - w) / 2, so solving for
          half that gap gives w = 50% + 32rem. The 28rem here trims another
          4rem off that so the content sits a touch nearer the center. The
          padding takes over once the viewport is narrow enough that the calc
          exceeds it. */}
      <div className="mx-auto max-w-[calc(50%_+_28rem)] px-3 py-12 sm:px-4">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:gap-12">
          <div>
            <WordLogo className="h-7 w-auto text-fg-inverse" />
            <p className="mt-4 text-sm text-footer-muted">
              Good days at the office happen together.
            </p>
          </div>

          <div className="flex gap-10 sm:gap-16">
            {LINK_COLUMNS.map(({ heading, links }) => (
              <div key={heading}>
                <h2 className="text-xs uppercase tracking-[0.18em] text-footer-faint">
                  {heading}
                </h2>

                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      {"href" in link ? (
                        // Leaves the app, so it opens in its own tab and leaves
                        // the page where it is.
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={LINK_CLASSES}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => scrollToSection(link.targetId)}
                          className={LINK_CLASSES}
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-fg-inverse/15 pt-5">
          <p className="text-xs text-footer-faint">
            &copy; {new Date().getFullYear()} Hearth &middot; Made by the 2026
            Viget interns.
          </p>
        </div>
      </div>
    </footer>
  );
}
