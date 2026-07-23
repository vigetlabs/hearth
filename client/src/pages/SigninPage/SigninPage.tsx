import { useEffect, useState } from "react";

import SigninForm from "@/components/SigninForm/SigninForm";
import WordLogo from "@/components/Logo/WordLogo";

import "./SigninPage.css";

// Decorative emoji badges that float in the page margins around the sign-in
// card. Purely ornamental, so they are hidden from assistive tech and only
// shown on wide screens where there is room in the margins.
// `float` picks one of the drifting keyframe tracks defined in App.css and the
// speed/offset that give each badge its own slow, out-of-sync wander.
const EMOJI_BADGES = [
  {
    emoji: "🐂",
    position: "left-[19%] top-[27%]",
    float: { animation: "badge-float-a 8s ease-in-out infinite", delay: "0s" },
  },
  {
    emoji: "🌸",
    position: "right-[13%] top-[34%]",
    float: {
      animation: "badge-float-b 10s ease-in-out infinite",
      delay: "-4s",
    },
  },
  {
    emoji: "🚂",
    position: "left-[7%] top-[55%]",
    float: {
      animation: "badge-float-c 9s ease-in-out infinite",
      delay: "-9s",
    },
  },
  {
    emoji: "⛰️",
    position: "right-[8%] top-[57%]",
    float: {
      animation: "badge-float-d 11s ease-in-out infinite",
      delay: "-6s",
    },
  },
];

export default function SigninPage() {
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
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-page">
      {/* Faint background grid lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[8%] w-px bg-line" />
        <div className="absolute inset-y-0 left-[33%] w-px bg-line" />
        <div className="absolute inset-y-0 left-[67%] w-px bg-line" />
        <div className="absolute inset-y-0 right-[8%] w-px bg-line" />
        <div className="absolute inset-x-0 top-[13%] h-px bg-line" />
      </div>

      {/* Giant wordmark watermark, cut off at the bottom edge */}
      <WordLogo
        decorative
        className="pointer-events-none absolute -bottom-30 left-1/2 h-[33vh] w-auto max-w-none -translate-x-1/2 text-[#EDE2D1]"
      />

      {/* Floating emoji badges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
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
            {/* leading-[0] collapses the line box so flex centers the glyph
                itself rather than the baseline-aligned text line */}
            <span className="block leading-[0]">{emoji}</span>
          </div>
        ))}
      </div>

      {/* Top-left brand wordmark */}
      <div className="relative z-10 px-8 py-8 pl-16 pt-12 sm:px-12 sm:py-10 sm:pl-28 sm:pt-16">
        <WordLogo className="h-7 text-[#3D2114] sm:h-8" />
      </div>

      {/* Centered sign-in content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-24">
        <SigninForm />
      </div>
    </div>
  );
}
