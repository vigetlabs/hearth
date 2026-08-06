import "./Quote.css";

const AVATAR = "/images/landing/Sadie_Portrait.webp";

// The same four office emoji that float around the sign-in card, here as small
// white cards scattered into the panel's margins. Purely ornamental, so they
// are hidden from assistive tech, and only shown from `lg` up — below that the
// quote's measure reaches into the margins and there is no room for them.
//
// Positions are the centers of the cards as percentages of the panel, taken off
// the mock, so the scatter keeps its shape as the section grows and shrinks.
// Each card is nudged off square by a couple of degrees, alternating direction,
// so they read as dropped onto the panel rather than laid out on a grid.
const QUOTE_BADGES = [
  { emoji: "🐂", position: "left-[12%] top-[23.7%]", tilt: "rotate-[7deg]" },
  { emoji: "🌸", position: "left-[86.8%] top-[21.5%]", tilt: "-rotate-[7deg]" },
  { emoji: "🚂", position: "left-[10.4%] top-[65.7%]", tilt: "-rotate-[3deg]" },
  { emoji: "⛰️", position: "left-[88.6%] top-[65%]", tilt: "rotate-[3deg]" },
];

// Client quote, sitting directly below the product demo.
//
// The panel carries on the terracotta gradient the Product section starts: that
// section runs `strong` down to `strong-deep`, and this one picks up at
// `strong-deep` and finishes at `fill`, so the two read as one continuous wash
// behind the demo and the quote rather than as two panels butted together.
export default function Quote() {
  return (
    <section className="quote-section relative flex flex-col items-center overflow-hidden bg-[linear-gradient(to_bottom,var(--color-strong-deep)_0%,var(--color-fill)_100%)] px-4 pb-28 pt-12 text-center sm:pb-64 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
      >
        {QUOTE_BADGES.map(({ emoji, position, tilt }) => (
          <div
            key={emoji}
            className={`absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.125rem] bg-surface text-[1.625rem] shadow-badge-panel ${position} ${tilt}`}
          >
            {/* leading-[0] collapses the line box so flex centers the glyph
                itself rather than the baseline-aligned text line */}
            <span className="block leading-[0]">{emoji}</span>
          </div>
        ))}
      </div>

      <figure className="relative z-10 flex flex-col items-center">
        <span
          aria-hidden="true"
          className="quote-mark font-bold text-fg-inverse"
        >
          &ldquo;
        </span>

        <blockquote className="quote-text mt-1 text-balance font-bold tracking-tight text-fg-inverse sm:mt-[0.75em]">
          I have a long commute to HQ. Knowing when others will be there helps
          me decide which days are worth it.
        </blockquote>

        {/* The face and the name are one unit: `alt=""` because the name is
            right there in the same row, so describing the photo as well would
            only read the attribution out twice. */}
        <figcaption className="quote-attribution mt-[1.3em] flex items-center gap-[0.85em] font-semibold text-fg-inverse sm:mt-[0.9em]">
          <img
            src={AVATAR}
            alt=""
            className="h-[3.4em] w-[3.4em] rounded-full object-cover sm:h-[2.8em] sm:w-[2.8em]"
          />
          {/* One line on desktop, a two-line stack beside the face on mobile.
              The dash isn't typed here because it moves between the two: it
              separates name from role on one line, and leads the name once
              they stack. Quote.css draws it in whichever place it belongs. */}
          <span className="quote-byline">
            <span className="quote-byline-name">Sadie Finn</span>
            <span>Client</span>
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
