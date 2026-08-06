// The mock schedule behind the Slack section: the week the message plans, the
// places a day can be set to, and where the card starts before anyone touches
// it. Shared by the message card and the edit modal that opens over it.
//
// The card is a picture of the product, not a live view of anyone's schedule,
// nothing is connected to the backend, as this is entirely presentational.

export const OFFICES = [
  { name: "Out", emoji: "🏠" },
  { name: "Boulder", emoji: "⛰️" },
  { name: "Chattanooga", emoji: "🚂" },
  { name: "Durham", emoji: "🐂" },
  { name: "Falls Church", emoji: "🌸" },
] as const;

export type OfficeName = (typeof OFFICES)[number]["name"];

export const DEFAULT_OFFICE: OfficeName = "Falls Church";

export type Schedule = readonly OfficeName[];

export const WEEK = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
] as const;

export const WEEK_DATES: readonly string[] = WEEK.map((day) => day.short);

export const INITIAL_SCHEDULE: Schedule = [
  "Falls Church",
  "Falls Church",
  "Chattanooga",
  "Durham",
  "Out",
];

export function emojiFor(name: OfficeName): string {
  return OFFICES.find((office) => office.name === name)?.emoji ?? "";
}
