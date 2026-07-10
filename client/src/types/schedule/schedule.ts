/**
 * The weekdays a user can mark as their default in-office days during signup.
 *
 * @TODO: Persist the selected default schedule to the API once an endpoint is
 * available.
 */
export interface Weekday {
  /** Stable identifier sent to the API when saving the user's schedule. */
  id: string;
  /** Abbreviated label shown on the card (e.g. "Mon"). */
  label: string;
}

export const WEEKDAYS: Weekday[] = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
];
