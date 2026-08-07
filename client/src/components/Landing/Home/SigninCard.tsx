import GoogleSsoButton from "@/components/auth/GoogleSsoButton";
//
// This is a single, page-colored rectangle behind the whole block (headline
// and subhead). Its purpose is the obscure the two vertical lines in the
// background which would otherwise run through the text.
//
// The geometry is all relative, so it holds at every viewport size:
//   - The top edge sits on the headline's own box, which lands ~0.15em above
//     the cap height.
//   - The bottom edge hangs 0.75rem past the subhead's box so the rules pick
//     back up with some breathing room under the descenders rather than right
//     off the glyph bottoms.
//   - Horizontally it covers the middle 80% of the 55vw copy column — 28vw to
//     72vw — which clears the rules at 35% and 65% by a wide margin at any
//     width, while staying out of the page margins where the floating emoji
//     badges sit (the outer rules at 8%/92% are well clear of the copy and are
//     meant to run uninterrupted).
//
// It has nothing to do on phones, which drop the rules — but it is the page
// color on the page color, so it stays invisible there rather than needing to
// be hidden.
const LINE_KNOCKOUT =
  "pointer-events-none absolute inset-x-[10%] -bottom-3 top-0 bg-page";

// The copy runs in a 55vw column on wide screens, where that leaves the margins
// the emoji badges sit in. A phone has no margins to spare, so the column goes
// full width and the badges move above and below it — and with the copy no
// longer sharing the screen with them, it also drops the nudge downward that
// keeps it clear of them.
export default function SigninCard() {
  return (
    <div className="flex w-full max-w-none translate-y-0 flex-col items-center text-center sm:w-[55vw] sm:translate-y-20">
      {/* The knockout is a positioned sibling, so the copy needs `relative` to
          stack above it. */}
      <div className="relative w-full">
        <div aria-hidden="true" className={LINE_KNOCKOUT} />

        {/* Sized so the headline still breaks into three lines on a phone
            ("Good days at the / office happen / together."), the same shape it
            takes in the wider columns above. */}
        <h1 className="relative text-[2.75rem] font-bold leading-[1.05] tracking-tight text-fg sm:text-[3.375rem] lg:text-[4.25rem]">
          Good days at the office happen together.
        </h1>

        <div className="relative mx-auto mt-10 max-w-2xl">
          <p className="text-lg font-medium text-fill sm:text-2xl">
            Make the most of your in-office days by seeing who&rsquo;ll be
            there.
          </p>
        </div>
      </div>

      <GoogleSsoButton className="mt-8 w-auto rounded-full border-2 border-line bg-surface px-7 py-3.5 text-base font-bold shadow-card hover:border-line hover:bg-surface-sunken sm:mt-16 sm:px-9 sm:py-4 sm:text-lg" />
    </div>
  );
}
