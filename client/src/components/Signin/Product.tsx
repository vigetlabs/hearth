import { useState } from "react";

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
// The whole section sits on its own terracotta panel: a vertical gradient from
// #B44820 (Brand/Confirmed) down to #8C3320, running the full width and height
// of the section rather than being a card inside it. Because the gradient is
// the section's own background, it stretches to fit the demo below the header.
export default function Product() {
  const [reducedMotion] = useState(prefersReducedMotion);

  return (
    <section className="product-section flex min-h-screen flex-col items-center bg-[linear-gradient(to_bottom,#B44820_0%,#8C3320_100%)] px-4 py-24 text-center sm:py-32">
      <p className="product-eyebrow font-semibold uppercase tracking-[0.22em] text-[#F2B88C]">
        The Product
      </p>

      <h2 className="product-heading mt-6 font-bold leading-[1.05] tracking-tight text-[#F8F1E9]">
        Weekly planning across locations.
      </h2>

      {/* Measure is set in Product.css, off the heading's own line width, so
          this sits just inside the heading above it. */}
      <p className="product-subhead mt-6 font-medium leading-[1.45] text-[#D9B8A1]">
        A simple Monday&ndash;Friday view focused on day-level office
        attendance, so you can see who&rsquo;s in and check every office at a
        glance.
      </p>

      {/* Looping demo of the week view. It plays on its own and cannot be
          controlled: no `controls`, and `pointer-events-none` on the frame so
          clicks, taps and the right-click menu all pass straight through to the
          panel. Autoplay is only allowed for muted, inline video, hence `muted`
          and `playsInline` — without them mobile Safari opens it fullscreen
          instead of playing in place.

          The recording is its own browser mock on a desktop backdrop, so it
          gets no border or card of its own here — just rounded corners and a
          soft drop shadow to lift it off the terracotta. `.product-demo` holds
          the aspect ratio so the panel reserves the right amount of room before
          the file arrives and nothing below it shifts on load.

          Visitors who ask for reduced motion get the poster frame instead, and
          the video is never requested for them. It is the only way out of the
          loop: an always-on animation with no pause control is exactly what
          that setting exists to defuse. */}
      <div className="product-demo pointer-events-none mt-16 w-full max-w-[68rem] overflow-hidden rounded-2xl shadow-[0_30px_70px_-20px_#3A130A99] sm:mt-20">
        {reducedMotion ? (
          <img
            src={DEMO_POSTER}
            alt="The Hearth week view for the Boulder office, showing who is confirmed in on each day from Monday to Friday."
            className="block h-full w-full object-cover"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={DEMO_POSTER}
            aria-label="A silent, looping recording of the Hearth week view: picking office days for the week, confirming them, and checking another office."
            className="block h-full w-full object-cover"
          >
            <source src="/video/product-demo.mp4" type="video/mp4" />
          </video>
        )}
      </div>
    </section>
  );
}
