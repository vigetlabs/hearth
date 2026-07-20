// Decorative rust-colored glow that blooms out of two opposite corners of the
// onboarding text panel: top-right and bottom-left. The SVG's glow naturally
// sits in its bottom-left, so the top-right copy is simply rotated 180°.
//
// Purely ornamental: hidden from assistive tech and never intercepts pointer
// events. It fills and clips itself, so the parent only needs `position:
// relative` and the content above it needs to sit at `z-10` or higher.
export default function CornerGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <img
        src="/images/corner-glow.svg"
        alt=""
        className="absolute bottom-0 left-0 w-[635px] max-w-[80%]"
      />
      <img
        src="/images/corner-glow.svg"
        alt=""
        className="absolute -top-10 -right-24 w-[635px] max-w-[80%] rotate-180"
      />
    </div>
  );
}
