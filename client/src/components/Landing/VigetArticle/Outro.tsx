import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

import "./Outro.css";

// Sign-off card, the last thing on the sign-in page before the footer: the page
// has made its case by here, so this is the second and final offer of the same
// sign-in button the hero opens with
export default function Outro() {
  return (
    <section className="flex justify-center bg-page px-4 pb-24 sm:pb-32">
      {/* No top padding: the article section above ends on its own `py`, which
          is the gap the mock shows between the captions and the card. */}
      <div className="outro-card relative flex w-full max-w-[71rem] flex-col items-center justify-center overflow-hidden rounded-4xl bg-[linear-gradient(to_bottom,var(--color-strong)_0%,var(--color-fill)_100%)] px-6 py-16 text-center shadow-signoff">
        {/* The hearth H mark in the bottom right of the Outro box.
            Purely ornamental, so it's hidden from assistive tech. Anchored to
            the card's bottom edge and set at 81.5% across, which puts the
            mark's short left column in the margin beside the copy and runs its
            tall right column off the card entirely — the card's
            `overflow-hidden` does the cropping. Every number is a percentage of
            the card, so the mark keeps its place in the corner as the card
            grows and shrinks.

            The -2.5% is the mark's own bottom padding taken back out: the
            path in `favicon.svg` ends at y=28.08 of a 29-unit viewBox, so
            sitting the box on `bottom-0` leaves 3.2% of its height — 2.5% of
            the card's — as a sliver of terracotta under the glyph. Dropping it
            by that much puts the glyph itself flush with the card's edge. */}
        <div
          aria-hidden="true"
          className="outro-mark pointer-events-none absolute -bottom-[2.5%] left-[81.5%] h-[79%] bg-white/15"
        />

        <div className="relative flex flex-col items-center">
          <h2 className="outro-heading font-bold leading-[1.05] tracking-tight text-fg-inverse">
            See you around :)
          </h2>

          <p className="outro-sub mt-5 font-medium leading-[1.5] text-fg-inverse-muted">
            We hope it helps your team to come in together.
          </p>

          <GoogleSsoButton className="outro-sub mt-8 w-auto rounded-full border-transparent px-8 py-[0.95em] hover:border-transparent" />
        </div>
      </div>
    </section>
  );
}
