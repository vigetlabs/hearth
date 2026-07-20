// Each office has a matching WebP hero photo in `public/`, keyed by a slugified
// office name (e.g. "Falls Church" -> "falls-church-hero.webp"). Shown before
// the user has picked an office, while no card is selected. A missing file
// degrades to the panel's placeholder background instead of breaking the build.
export const DEFAULT_OFFICE_NAME = "Falls Church";

// Slugify an office name into the id used to look up its hero photo.
export function heroIdForOfficeName(name: string) {
  return name.toLowerCase().trim().replaceAll(" ", "-");
}

export function heroImageFor(officeId: string) {
  const id = officeId || heroIdForOfficeName(DEFAULT_OFFICE_NAME);
  return `/images/office/${id}-hero.webp`;
}

// The hero shown on first mount, before any office is picked. Exported so the
// preceding signup screen can warm it into cache ahead of time — otherwise the
// browser only starts fetching this ~70KB background once the office panel
// mounts, leaving a gray flash in its place.
export const DEFAULT_HERO_IMAGE = heroImageFor(
  heroIdForOfficeName(DEFAULT_OFFICE_NAME),
);
