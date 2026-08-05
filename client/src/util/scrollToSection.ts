// Whether the visitor has asked for reduced motion. Read at call time rather
// than at mount, since it's a fresh decision on every jump and the setting can
// change mid-visit.
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll the page down (or back up) to a section of the marketing page, given
 * the `id` that section carries. Shared by the floating nav bar and the footer's
 * About column, which both point at the same handful of sections.
 *
 * `behavior: "smooth"` hands the animation to the browser, which eases in and
 * out of the travel on its own — worth having on a page this tall, where a jump
 * can cover several viewports and an instant cut leaves no sense of how far you
 * moved.
 *
 * That's exactly the kind of motion `prefers-reduced-motion` exists to defuse,
 * though, so visitors who ask for less of it get taken straight there instead.
 *
 * Every section opens with generous top padding of its own, which is the room
 * the floating bar sits over, so landing a section's top edge on the top of the
 * viewport puts its header clear of the bar.
 */
export function scrollToSection(targetId: string) {
  document.getElementById(targetId)?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}
