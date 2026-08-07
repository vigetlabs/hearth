import { useEffect, useState } from "react";

import WordLogo from "@/components/landing/Logo/WordLogo";
import Logo from "@/components/landing/Logo/Logo";
import SigninCard from "@/components/Landing/Home/SigninCard";

import "./Home.css";

// Decorative emoji badges that float in the page margins around the sign-in
// card. Purely ornamental, so they are hidden from assistive tech.
//
// `position` carries two arrangements. The `lg:` one is the wide-screen
// layout, where the copy column leaves generous margins and the badges can sit
// well out from it. Below that the margins are only as wide as the page
// padding, so the badges move to the corners above and below the copy instead
// of beside it — which also flips their vertical order, hence a full set of
// coordinates per badge rather than a shared pattern.
//
// `float` picks one of the drifting keyframe tracks defined in Home.css and the
// speed/offset that give each badge its own slow, out-of-sync wander.
const EMOJI_BADGES = [
  {
    emoji: "🚂",
    position: "left-[8%] top-[3%] lg:left-[7%] lg:top-[50%]",
    float: {
      animation: "badge-float-c 9s ease-in-out infinite",
      delay: "-9s",
    },
  },
  {
    emoji: "⛰️",
    position: "right-[8%] top-[7.5%] lg:right-[8%] lg:top-[52%]",
    float: {
      animation: "badge-float-d 11s ease-in-out infinite",
      delay: "-6s",
    },
  },
  {
    emoji: "🐂",
    position: "left-[7%] top-[61.5%] lg:left-[19%] lg:top-[22%]",
    float: { animation: "badge-float-a 8s ease-in-out infinite", delay: "0s" },
  },
  {
    emoji: "🌸",
    position: "right-[9%] top-[65%] lg:right-[13%] lg:top-[29%]",
    float: {
      animation: "badge-float-b 10s ease-in-out infinite",
      delay: "-4s",
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
            which shares the hero's bottom edge with the wordmark.

            Phones drop the rules entirely: their stops are cut to the
            wordmark's letters, and the mark down there is the brand mark
            instead (see below), so there is nothing for them to meet. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[9.5rem] hidden sm:block"
        >
          <div className="absolute bottom-[var(--rule-stop-1)] left-[8%] top-0 w-px bg-rule" />
          <div className="absolute bottom-[var(--rule-stop-2)] left-[35%] top-0 w-px bg-rule" />
          <div className="absolute bottom-[var(--rule-stop-3)] left-[65%] top-0 w-px bg-rule" />
          <div className="absolute bottom-[var(--rule-stop-4)] right-[8%] top-0 w-px bg-rule" />
        </div>

        {/* Giant watermark, resting on the bottom edge of the hero — which
            reaches past the fold, so the mark arrives cropped and fills in as
            the page scrolls. The content above reserves room for it with
            matching bottom padding.

            Which mark it is depends on the width. Spelled across a phone the
            wordmark reduces to a thread, so narrow screens show the brand mark
            instead — nearly square, so it can stay big. `--wordmark-h` is
            whichever one's height (see Home.css), which keeps the crop and the
            padding above working the same either way. */}
        <Logo
          decorative
          className="pointer-events-none absolute bottom-0 left-1/2 h-[var(--wordmark-h)] w-auto -translate-x-1/2 text-watermark sm:hidden"
        />
        <WordLogo
          decorative
          className="pointer-events-none absolute bottom-0 left-1/2 hidden h-[var(--wordmark-h)] w-auto -translate-x-1/2 text-watermark sm:block"
        />

        {/* Floating emoji badges. Their resting spots are percentages of this
            layer, so the layer is kept one viewport tall rather than spanning
            the taller hero — otherwise stretching the hero past the fold would
            fan the badges apart.

            Where the layer starts differs by width for the same reason the
            badge coordinates do. On wide screens it is offset by half the
            hidden slice, which moves the badges down in step with the sign-in
            card below. Narrower ones put two badges up near the top of the
            screen, where that offset shrinks with the viewport and can walk
            them into the nav bar, so there the layer starts at a fixed point
            below the bar and the badges hang off that instead. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-28 h-[calc(100vh_-_7rem)] lg:top-[calc(var(--wordmark-hidden)_/_2)] lg:h-screen"
        >
          {EMOJI_BADGES.map(({ emoji, position, float }) => (
            <div
              key={emoji}
              className={`badge-float absolute flex h-11 w-11 items-center justify-center rounded-full border-2 border-line/55 bg-surface text-xl shadow-badge lg:h-[70px] lg:w-[70px] lg:text-[30px] ${position}`}
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

      <section className="px-4 pb-10 pt-10 sm:pb-14 sm:pt-28">
        <p className="landing-tagline mx-auto text-center font-semibold leading-[1.45] text-fg">
          A shared office planning tool for{" "}
          <span className="landing-tagline-pill inline-flex items-center rounded-full bg-strong-deep align-middle font-bold leading-[1.6] text-fg-inverse">
            <span className="inline-block scale-[0.85]">hybrid teams</span>
          </span>
          <span className="hidden sm:inline"> to make office days count.</span>
        </p>
      </section>

      <div aria-hidden="true" className="h-[10vh]" />
    </>
  );
}
