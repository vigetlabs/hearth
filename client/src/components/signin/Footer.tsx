import WordLogo from "@/components/Logo/WordLogo";

// Placeholder link columns. Like the sign-in page nav, none of these
// destinations exist yet, so they render as inert text rather than links —
// nothing should advertise an action that doesn't go anywhere.
const LINK_COLUMNS = [
  { heading: "About", links: ["Home", "Product", "Why Hearth"] },
  { heading: "Company", links: ["Article", "Viget"] },
];

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
                    <li key={link} className="text-sm text-footer-muted">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-fg-inverse/15 pt-5">
          <p className="text-xs text-footer-faint">
            &copy; {new Date().getFullYear()} Hearth &middot; Made by the summer
            2026 intern cohort
          </p>
        </div>
      </div>
    </footer>
  );
}
