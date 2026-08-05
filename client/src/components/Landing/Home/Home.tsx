import { useEffect, useState } from "react";

import WordLogo from "@/components/Logo/WordLogo";
import SigninCard from "@/components/Landing/Home/SigninCard";

import "./Home.css";

// Decorative emoji badges that float in the page margins around the sign-in
// card. Purely ornamental, so they are hidden from assistive tech and only
// shown on wide screens where there is room in the margins.
// `float` picks one of the drifting keyframe tracks defined in Home.css and the
// speed/offset that give each badge its own slow, out-of-sync wander.
const EMOJI_BADGES = [
  {
    emoji: "🐂",
    position: "left-[19%] top-[22%]",
    float: { animation: "badge-float-a 8s ease-in-out infinite", delay: "0s" },
  },
  {
    emoji: "🌸",
    position: "right-[13%] top-[29%]",
    float: {
      animation: "badge-float-b 10s ease-in-out infinite",
      delay: "-4s",
    },
  },
  {
    emoji: "🚂",
    position: "left-[7%] top-[50%]",
    float: {
      animation: "badge-float-c 9s ease-in-out infinite",
      delay: "-9s",
    },
  },
  {
    emoji: "⛰️",
    position: "right-[8%] top-[52%]",
    float: {
      animation: "badge-float-d 11s ease-in-out infinite",
      delay: "-6s",
    },
  },
];

// Opening section of the sign-in page: the hero holding the sign-in card and
// the giant wordmark watermark, followed by the tagline that sits below it.
export default function Home() {
  // Pause the drifting badges whenever this screen isn't actually being looked
  // at — either the tab is hidden (another tab is focused) or the browser
  // window itself has lost focus to another desktop window. `visibilitychange`
  // only covers the tab case, so we also watch window focus/blur and require
  // both the page to be visible and to have focus for the badges to run.
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const update = () => setPaused(document.hidden || !document.hasFocus());
    update();
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    window.addEventListener("blur", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
    };
  }, []);

  return (
    <>
      {/* Hero — one full viewport plus the slice of the wordmark watermark that
          hangs below the fold (see `.landing-hero` in Home.css), so the
          watermark is always cropped by the same amount no matter the window
          size. The decorative layers below are absolutely positioned against
          this section (not the whole document), so they stay put as the page
          scrolls down to the footer. */}
      <div
        id="home"
        className="landing-hero relative flex min-h-[calc(100vh_+_var(--wordmark-hidden))] flex-col overflow-hidden"
      >
        {/* Faint background grid lines. They start below the fixed nav bar
            rather than at the top of the hero: the bar sits about 6.25rem down
            from the top of the page (its own height plus the gap above it).

            At the other end each line stops right where it meets the top of the
            letter it crosses, so none of them run down into the wordmark. The
            four letters meet the lines at four different heights, so each gets
            its own stop — see `--rule-stop-*` in Home.css for where the
            numbers come from. They're offsets from the bottom of this layer,
            which shares the hero's bottom edge with the wordmark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[9.5rem]"
        >
          <div className="absolute bottom-[var(--rule-stop-1)] left-[8%] top-0 w-px bg-[#E0D4BF]" />
          <div className="absolute bottom-[var(--rule-stop-2)] left-[35%] top-0 w-px bg-[#E0D4BF]" />
          <div className="absolute bottom-[var(--rule-stop-3)] left-[65%] top-0 w-px bg-[#E0D4BF]" />
          <div className="absolute bottom-[var(--rule-stop-4)] right-[8%] top-0 w-px bg-[#E0D4BF]" />
        </div>

        {/* Giant wordmark watermark, resting on the bottom edge of the hero —
            which reaches past the fold, so the word arrives half-cropped and
            fills in as the page scrolls. `--wordmark-h` already folds in the
            narrow-viewport width cap, so the whole word still fits across on
            small screens. The content above reserves room for it with matching
            bottom padding. */}
        <WordLogo
          decorative
          className="pointer-events-none absolute bottom-0 left-1/2 h-[var(--wordmark-h)] w-auto -translate-x-1/2 text-[#EDE2D1]"
        />

        {/* Floating emoji badges. Their resting spots are percentages of this
            layer, so the layer is kept one viewport tall rather than spanning
            the taller hero — otherwise stretching the hero past the fold would
            fan the badges apart. Offsetting it by half the hidden slice moves
            them down in step with the sign-in card below. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[calc(var(--wordmark-hidden)_/_2)] hidden h-screen lg:block"
        >
          {EMOJI_BADGES.map(({ emoji, position, float }) => (
            <div
              key={emoji}
              className={`badge-float absolute flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-line/55 bg-surface text-[30px] shadow-[0px_10px_24px_-4px_#66381A29] ${position}`}
              style={{
                animation: float.animation,
                animationDelay: float.delay,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              <span>{emoji}</span>
            </div>
          ))}
        </div>

        {/* Centered sign-in content. The top padding clears the fixed nav bar and the bottom
            padding clears the wordmark watermark plus a small gap. Because that
            padding tracks the watermark, the card keeps its balance between the
            nav and the top of the word as the hero grows past the fold. */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-[calc(var(--wordmark-h)_+_4vh)] pt-28">
          <SigninCard />
        </div>
      </div>

      {/* Tagline, sitting just below the giant wordmark at the base of the
          hero. Wrapping to two balanced lines (see `.landing-tagline` in
          Home.css).

          The "hybrid teams" pill flows inline with the sentence:
          `inline-flex` + `align-middle` keeps it vertically centered on the
          text line rather than sitting on the baseline. Its own type scale is
          one step below the sentence, and because every dimension it owns is
          in `em` (see the CSS), it tracks the sentence exactly as that scales.
          Shrinking that font size would shrink the pill with it, so the
          smaller lettering comes from scaling the glyphs inside the box — the
          box measures at full size, the text just draws smaller. */}
      <section className="px-4 py-20 sm:py-28">
        <p className="landing-tagline mx-auto text-center font-medium leading-[1.45] text-fg">
          A shared office planning tool for{" "}
          <span className="landing-tagline-pill inline-flex items-center rounded-full bg-[#9E3B20] align-middle font-bold leading-[1.6] text-fg-inverse">
            <span className="inline-block scale-[0.85]">hybrid teams</span>
          </span>{" "}
          to make office days count.
        </p>
      </section>

      <div aria-hidden="true" className="h-[30vh]" />
    </>
  );
}
