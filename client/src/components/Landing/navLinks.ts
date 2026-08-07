// The in-page stops the marketing nav offers, shared by the two surfaces that
// offer them: the row of links in the floating bar on wide screens, and the
// dropdown the plus button opens on phones. Both live here so adding a section
// — or changing what a selected link looks like — lands on both at once.
//
// Off-site destinations are separate; those are in `links.ts`.

export const NAV_LINKS = [
  { label: "Home", targetId: "home" },
  { label: "Product", targetId: "product" },
  { label: "Why Hearth", targetId: "why-hearth" },
  { label: "Viget article", targetId: "viget-article" },
];

// Color for one nav link. The section the page is parked on holds the full
// terracotta the rest of the page accents with (`strong`), so the nav always
// says where you are. Singling out an *unselected* label previews that move in
// the ramp's lightest step (`strong-soft`) — lighter than the selected color,
// so a previewed label can never be mistaken for the selected one. The selected
// label takes no preview at all: it is already at the end of that ramp, and
// lightening it would read as it switching off.
//
// `preview` picks what does the singling out, which differs by surface: the
// bar's links are plain anchors and take `hover`, while the dropdown's items
// take Radix's `data-[highlighted]`, which covers arrow keys as well as the
// pointer. Both branches spell their classes out in full — Tailwind reads them
// from the source text, so a name assembled from pieces would never be built.
export function navLinkClass(
  active: boolean,
  preview: "hover" | "highlighted",
): string {
  if (active) return "text-strong";

  return preview === "hover"
    ? "text-fg hover:text-strong-soft"
    : "text-fg data-[highlighted]:text-strong-soft";
}
