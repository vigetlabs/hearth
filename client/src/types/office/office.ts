/**
 * The offices a user can pick as their default during signup. Mocked here as a
 * static list until the API exposes an offices endpoint.
 *
 * @TODO: Replace `OFFICES` with data fetched from the API once available.
 */
export interface Office {
  /** Stable identifier sent to the API when saving the user's default office. */
  id: string;
  /** Display name shown on the card. */
  name: string;
  /** Emoji shown above the name. */
  emoji: string;
  /** Renders with a dashed border to set it apart (e.g. the "Remote" option). */
  dashed?: boolean;
}

export const OFFICES: Office[] = [
  { id: "boulder", name: "Boulder", emoji: "⛰️" },
  { id: "falls-church", name: "Falls Church", emoji: "🌸" },
  { id: "chattanooga", name: "Chattanooga", emoji: "🚂" },
  { id: "durham", name: "Durham", emoji: "🐂" },
  { id: "remote", name: "Remote", emoji: "🏡", dashed: true },
];
