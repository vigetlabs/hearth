import GoogleSsoButton from "@/components/GoogleSsoButton/GoogleSsoButton";

// Knocks the hero's decorative vertical rules out from behind the copy, so the
// two inner rules break cleanly around the headline block instead of running
// through the words.
//
// This is a single page-colored rectangle behind the whole block (headline
// through subhead) rather than a mask on the text itself. A per-line inline
// mask follows the shape of the wrapped text, but it leaves the rules showing
// in the gap between the headline and the subhead, and with the headline's
// tight `leading-[1.05]` each wrapped line's mask overlaps — and paints over —
// the descenders of the line above it. Nothing paints over the text here.
//
// The geometry is all relative, so it holds at every viewport size:
//   - The top edge sits on the headline's own box, which lands ~0.15em above
//     the cap height (half-leading plus the gap between ascent and cap). That
//     is tighter than the font's ascent line the old mask used, and it scales
//     down with the type, so the rules keep the same visual clearance at every
//     step of the headline's responsive type scale.
//   - The bottom edge hangs 0.75rem past the subhead's box so the rules pick
//     back up with some breathing room under the descenders rather than right
//     off the glyph bottoms.
//   - Horizontally it covers the middle 80% of the 55vw copy column — 28vw to
//     72vw — which clears the rules at 33% and 67% by a wide margin at any
//     width, while staying out of the page margins where the floating emoji
//     badges sit (the outer rules at 8%/92% are well clear of the copy and are
//     meant to run uninterrupted).
const LINE_KNOCKOUT =
  "pointer-events-none absolute inset-x-[10%] -bottom-3 top-0 bg-page";

export default function SigninForm() {
  return (
    <div className="flex w-[55vw] max-w-none translate-y-20 flex-col items-center text-center">
      {/* The knockout is a positioned sibling, so the copy needs `relative` to
          stack above it. */}
      <div className="relative w-full">
        <div aria-hidden="true" className={LINE_KNOCKOUT} />

        <h1 className="relative text-[3.375rem] font-bold leading-[1.05] tracking-tight text-fg lg:text-[4.25rem]">
          Good days at the office happen together.
        </h1>

        <div className="relative mx-auto mt-10 max-w-2xl">
          <p className="text-xl font-medium text-fill sm:text-2xl">
            Make the most of your in-office days by seeing who&rsquo;ll be
            there.
          </p>
        </div>
      </div>

      <GoogleSsoButton className="mt-16 w-auto rounded-full border-2 border-line bg-surface px-9 py-4 text-lg font-bold shadow-card hover:border-line hover:bg-surface-sunken" />
    </div>
  );
}
