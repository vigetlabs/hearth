// Decorative layered "flames" that rise behind the signin form.
//
// Eight layers stack from the bottom of the page upward. Back layers are darker,
// taller and broader; front layers lighter, shorter and narrower, so the fire
// reads with depth. The color ramp runs from the app's darkest terracotta up to
// a warm yellow: the three darkest fills reuse existing App.css tokens (via
// `var()`) so they track the palette; the lighter amber → yellow shades are
// decorative one-offs specific to this illustration.
//
// Each layer is a row of flame tongues generated from its own seed and a
// per-layer horizontal shift, so the tongues of every layer start at a different
// x and their tips/gaps never line up — they interleave and lick past one
// another. Tongues also overscan past both edges and are clipped by the viewBox,
// so the fire runs off the page seamlessly on the left and right. SVGs stretch
// to full page width (`preserveAspectRatio="none"`), scaling horizontally while
// keeping their pixel height.
//
// Purely decorative — hidden from assistive tech.

interface Layer {
  /** Fill color: an App.css token or a decorative hex from the amber ramp. */
  color: string;
  /** Rendered height in px; also the viewBox height. Back layers are taller. */
  height: number;
  /** Number of flame tongues across the visible width. */
  tongues: number;
  /** Deterministic seed for this layer's tongue shapes. */
  seed: number;
  /** Horizontal offset as a fraction of a tongue-width — staggers each layer. */
  shiftFrac: number;
}

// Back (dark, tall, broad) → front (light, short, narrow). `shiftFrac` values are
// spread across 0–1 so no two layers start their tongues at the same x.
const LAYERS: Layer[] = [
  {
    color: "var(--color-fill-hover)",
    height: 260,
    tongues: 4,
    seed: 1.3,
    shiftFrac: 0.0,
  }, //  #6e2417 darkest
  {
    color: "var(--color-fill)",
    height: 236,
    tongues: 5,
    seed: 5.1,
    shiftFrac: 0.55,
  }, //       #8e3320
  {
    color: "var(--color-strong)",
    height: 212,
    tongues: 5,
    seed: 9.7,
    shiftFrac: 0.2,
  }, //      #b44820
  { color: "#c85a26", height: 188, tongues: 6, seed: 14.2, shiftFrac: 0.78 }, //                burnt orange
  { color: "#dc7c2f", height: 164, tongues: 6, seed: 19.8, shiftFrac: 0.33 }, //                orange
  { color: "#e89a3c", height: 140, tongues: 7, seed: 25.4, shiftFrac: 0.62 }, //                amber
  { color: "#f0bb4e", height: 114, tongues: 7, seed: 31.1, shiftFrac: 0.12 }, //                warm gold
  { color: "#f6dc6b", height: 90, tongues: 8, seed: 37.6, shiftFrac: 0.87 }, //                  soft yellow, brightest
];

const VIEW_W = 1440;

// Deterministic pseudo-random in [0, 1) — keeps tongues varied but stable across
// renders (computed once at module load, no runtime randomness).
function noise(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

const round = (n: number) => Math.round(n);

// Build a row of flame tongues as a single closed path. Each tongue rises from
// the baseline in a bulging curve, tapers to a sharp tip nudged sideways (the
// "lick"), and curves back down. The row overscans one tongue-width past each
// edge so the outermost tongues get clipped by the viewBox — the fire bleeds off
// the page rather than ending on a flat baseline.
function buildFlames({ height, tongues, seed, shiftFrac }: Layer): string {
  const H = height;
  const overscan = VIEW_W / tongues; // bleed one tongue-width past each edge
  const span = VIEW_W + overscan * 2;
  const count = tongues + 2; // two extra tongues fill the overscan
  const slot = span / count;
  const start = -overscan;

  // Baseline begins well left of the viewBox so the fill covers the clipped edge.
  let d = `M ${round(start - slot)},${H}`;
  for (let t = 0; t < count; t++) {
    const r1 = noise(seed + t * 1.7);
    const r2 = noise(seed + t * 3.3 + 0.9);
    const r3 = noise(seed + t * 5.1 + 0.4);
    const r4 = noise(seed + t * 2.2 + 1.6);

    // Center, width, tip height and sideways lick all vary per tongue — and the
    // per-layer shift slides the whole row so highs/lows land at unique x's.
    const cx =
      start + (t + 0.5) * slot + shiftFrac * slot + (r1 - 0.5) * slot * 0.5;
    const hw = slot * (0.32 + r2 * 0.14); // half-width — leaves a gap between tongues
    const tipY = H * (0.04 + r3 * 0.16); // tip near the top of the layer
    const lick = (r4 - 0.5) * slot * 0.8; // sideways flicker of the tip
    const tipX = cx + lick;
    const tongueH = H - tipY;
    const leftBase = cx - hw;
    const rightBase = cx + hw;

    // Baseline to the tongue, up the bulging left side to the tip, back down.
    d += ` L ${round(leftBase)},${H}`;
    d += ` C ${round(cx - hw * 0.85)},${round(H - tongueH * 0.35)} ${round(
      tipX - hw * 0.22,
    )},${round(tipY + tongueH * 0.28)} ${round(tipX)},${round(tipY)}`;
    d += ` C ${round(tipX + hw * 0.22)},${round(tipY + tongueH * 0.28)} ${round(
      cx + hw * 0.85,
    )},${round(H - tongueH * 0.35)} ${round(rightBase)},${H}`;
  }
  // Baseline runs past the right edge before closing, covering the clipped edge.
  d += ` L ${round(start + span + slot)},${H} Z`;
  return d;
}

export default function SigninMountains() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 select-none"
    >
      {LAYERS.map((layer, i) => (
        <svg
          key={i}
          viewBox={`0 0 ${VIEW_W} ${layer.height}`}
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full"
          style={{ height: layer.height }}
        >
          <path d={buildFlames(layer)} fill={layer.color} />
        </svg>
      ))}
    </div>
  );
}
