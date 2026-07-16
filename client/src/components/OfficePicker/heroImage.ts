// Each office has a matching WebP hero photo in `public/`. Shown before the user
// has picked an office, while no card is selected. A missing file degrades to
// the panel's placeholder background instead of breaking the build.
export const DEFAULT_HERO_OFFICE_ID = "falls-church";

export function heroImageFor(officeId: string) {
  const id = officeId || DEFAULT_HERO_OFFICE_ID;
  return `/images/office/${id}-hero.webp`;
}

// The hero shown on first mount, before any office is picked. Exported so the
// preceding signup screen can warm it into cache ahead of time — otherwise the
// browser only starts fetching this ~70KB background once the office panel
// mounts, leaving a gray flash in its place.
export const DEFAULT_HERO_IMAGE = heroImageFor(DEFAULT_HERO_OFFICE_ID);
