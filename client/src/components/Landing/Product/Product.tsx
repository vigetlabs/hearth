import { useRef, useState } from "react";

import PauseIcon from "../../icons/PauseIcon";
import PlayIcon from "../../icons/PlayIcon";

import "./Product.css";

const DEMO_POSTER = "/video/product-demo-poster.webp";

// Whether the visitor has asked for reduced motion. Read once at mount rather
// than subscribed to: the demo either loads or it doesn't, and swapping a
// playing video for a still mid-visit would be more jarring than either state.
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// "Product" section of the sign-in page, sitting between the home section and
// "Why Hearth" — the section header, followed by a looping screen recording of
// the week view being planned and confirmed.
//
// The whole section sits on a terracotta panel: a vertical gradient running the
// full width and height of the section rather than being a card inside it.
// Because the gradient is the section's own background, it stretches to fit the
// demo below the header.
//
// The panel doesn't stop here — the Quote section below continues it, so the
// two together are one wash down the terracotta ramp, from `strong` to `fill`.
// This half runs `strong` to `strong-deep`, the color the mock shows at the
// seam, and Quote picks up from there.
export default function Product() {
  const [reducedMotion] = useState(prefersReducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Tracked from the video's own play/pause events rather than set by the
  // click handler, so the button always reflects what the element is actually
  // doing — including a browser that declined to autoplay in the first place.
  const [playing, setPlaying] = useState(true);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      // Muted inline playback resumed from a click is always allowed, but
      // play() still returns a promise; swallow it so a rejection (a tab
      // backgrounded mid-click, say) doesn't surface as an unhandled error.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  return (
    <section
      id="product"
      className="product-section flex min-h-screen flex-col items-center bg-[linear-gradient(to_bottom,var(--color-strong)_0%,var(--color-strong-deep)_100%)] px-4 py-24 text-center sm:py-32"
    >
      <p className="product-eyebrow font-semibold uppercase tracking-[0.22em] text-panel-eyebrow">
        The Product
      </p>

      <h2 className="product-heading mt-6 font-bold leading-[1.05] tracking-tight text-panel-heading">
        Weekly planning across locations.
      </h2>

      <p className="product-subhead mt-6 font-medium leading-[1.45] text-panel-body">
        A simple Monday&ndash;Friday view focused on day-level office
        attendance, so you can see who&rsquo;s in and check every office at a
        glance.
      </p>

      {/* Looping demo of the week view. Autoplay is only allowed for muted, 
          inline video, hence `muted` and `playsInline` — without them mobile
          Safari opens it fullscreen instead of playing in place.

          `.product-demo` holds the aspect ratio so 
          the panel reserves the right amount of room before
          the file arrives and nothing below it shifts on load.

          Visitors who ask for reduced motion get the poster frame instead, and
          the video is never requested for them — an always-on animation is
          exactly what that setting exists to defuse. Everyone else gets the
          pause button below, which sits on the frame rather than appearing on
          hover: a loop you can't obviously stop is the thing worth avoiding, so
          the control has to be visible before you go looking for it. */}
      <div className="product-demo relative mt-16 w-full max-w-[65rem] overflow-hidden rounded-2xl shadow-demo sm:mt-20">
        {reducedMotion ? (
          <img
            src={DEMO_POSTER}
            alt="The Hearth week view for the Boulder office, showing who is confirmed in on each day from Monday to Friday."
            className="block h-full w-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={DEMO_POSTER}
              aria-label="A silent, looping recording of the Hearth week view: picking office days for the week, confirming them, and checking another office."
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="pointer-events-none block h-full w-full object-cover"
            >
              <source src="/video/product-demo.mp4" type="video/mp4" />
            </video>

            <button
              type="button"
              onClick={togglePlayback}
              aria-label={playing ? "Pause the demo" : "Play the demo"}
              className="absolute bottom-3 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:bottom-5 sm:right-5 sm:h-12 sm:w-12"
            >
              {playing ? (
                <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
