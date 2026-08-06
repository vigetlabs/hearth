import "./WhyHearth.css";

const DAY_SHOT = "/images/landing/example-day.png";

// Callouts pointing at features of the day card. From `lg` up each one is
// pinned to the part of the screenshot it describes and joined to it by a
// rule; below that there is no room in the margins, so they fall back to a
// plain list under the image and the rules drop away.
//
// Positions are percentages of the figure — which is exactly as tall and wide
// as the screenshot's own box at `lg` — so the scatter keeps its shape as the
// section grows and shrinks. `top` is the center of the row, hence the
// half-height offset on each. The left column runs just past the card's left
// edge (to 38.5% across, a touch over the edge's 37.5%) and the right one
// starts at its right edge (61.7%), so every rule ends against the card rather
// than at some arbitrary length.
//
// Callouts are positioned relative to the figure, a certain distance away, with the two
// lower callouts pulled in slightly — the right one more so, the left one less.
const NOTES = [
  {
    label: "Cross-office visitors called out 📣",
    side: "left",
    position: "lg:left-0 lg:right-[61.5%] lg:top-[13.5%]",
  },
  {
    label: "Confirmed vs. planning modes",
    side: "left",
    position: "lg:left-[4%] lg:right-[61.5%] lg:top-[28.5%]",
  },
  {
    label: "Peer visibility",
    side: "right",
    position: "lg:left-[61.7%] lg:right-[17%] lg:top-[42.3%]",
  },
] as const;

// The two headline claims, as small white cards dropped into the margins on
// either side of the screenshot. Same treatment as the badges on the hero and
// the quote panel: nudged a few degrees off square so they read as dropped onto
// the page rather than laid out on a grid.
//
// `position` is the center of the card, so it stays put as the card's own width
// changes with the type inside it.
const PILLS = [
  {
    label: "Calendar power",
    emoji: "📅",
    position: "lg:left-[13.3%] lg:top-[42.1%]",
    tilt: "lg:-rotate-[7deg]",
  },
  {
    label: "Whiteboard simplicity",
    emoji: "🧽",
    position: "lg:left-[84.3%] lg:top-[29.8%]",
    tilt: "lg:rotate-[5deg]",
  },
] as const;

// "Why Hearth" section of the sign-in page, sitting between the quote and the
// Viget article — the section header, then a single day of the week view with
// the things worth pointing at called out around it.
//
// The terracotta wash that runs behind Product and Quote ends above this, so
// the section comes back to the page's cream and stays there through the
// article section below.
export default function WhyHearth() {
  return (
    <section
      id="why-hearth"
      className="why-hearth-section flex flex-col items-center bg-page px-4 py-24 text-center sm:py-32"
    >
      <p className="why-hearth-eyebrow font-semibold uppercase tracking-[0.22em] text-strong">
        Why Hearth
      </p>

      <h2 className="why-hearth-heading mt-6 font-semibold leading-[1.05] tracking-tight text-fg">
        Spot the best day{" "}
        <span className="text-strong-vivid">before you commute</span>
      </h2>

      {/* Measure is set in WhyHearth.css, off the heading's own line width, so
          this sits just inside the heading above it. */}
      <p className="why-hearth-subhead mt-6 font-medium leading-[1.45] text-fg">
        Hearth combines decision-making about scheduling with unmatched
        visibility and ease of use.
      </p>

      {/* The screenshot and everything pinned around it. The image is the only
          thing in the figure's flow at `lg` — both lists lift out to overlay
          it — so the figure is exactly the image's box and the percentage
          positions above resolve against it. Screenshot is aligned directly in
          the center below the header, everything else flows around it.*/}
      <div className="relative mt-20 flex w-full max-w-[64rem] flex-col items-center sm:mt-24">
        <img
          src={DAY_SHOT}
          width={510}
          height={1182}
          alt="A day in the Hearth week view: Tuesday, four people in, flagged as having two visitors and the most confirmed day of the week, above the list of seven people confirmed in office."
          className="why-hearth-shot w-[16rem] max-w-full lg:w-[24.5%]"
        />

        <ul className="mt-14 flex flex-col items-center gap-4 lg:absolute lg:inset-0 lg:mt-0 lg:block">
          {NOTES.map(({ label, side, position }) => (
            <li
              key={label}
              className={`why-hearth-note flex items-center gap-2 font-semibold leading-[1.35] text-fg lg:absolute lg:-translate-y-1/2 ${position} ${
                side === "left"
                  ? "lg:flex-row lg:text-right"
                  : "lg:flex-row-reverse lg:text-left"
              }`}
            >
              <span>{label}</span>
              {/* The line between the label and the card, pointing to things in the image. 
                  `flex-1` lets it take whatever is left between the two, so it stretches 
                  and shrinks with the gap instead of being a fixed length. */}
              <span
                aria-hidden="true"
                className="hidden h-[2px] flex-1 bg-line-accent lg:block"
              />
            </li>
          ))}
        </ul>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:absolute lg:inset-0 lg:mt-0 lg:block">
          {PILLS.map(({ label, emoji, position, tilt }) => (
            <li
              key={label}
              className={`why-hearth-pill flex items-center gap-[0.5em] whitespace-nowrap rounded-full border-[1.185px] border-line bg-surface px-[1.25em] py-[0.7em] cursor-default select-none font-semibold text-fg shadow-badge lg:absolute lg:-translate-x-1/2 lg:-translate-y-1/2 ${position} ${tilt}`}
            >
              <span>{label}</span>
              {/* leading-[0] collapses the line box so the glyph sits centered
                  on the label rather than on its baseline */}
              <span aria-hidden="true" className="block leading-[0]">
                {emoji}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
